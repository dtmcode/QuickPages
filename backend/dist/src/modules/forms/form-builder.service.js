"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormBuilderService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const email_service_1 = require("../../core/email/email.service");
let FormBuilderService = class FormBuilderService {
    db;
    emailService;
    constructor(db, emailService) {
        this.db = db;
        this.emailService = emailService;
    }
    async getForms(tenantId) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT * FROM forms WHERE tenant_id = ${tenantId} ORDER BY created_at DESC`);
        return result.rows || [];
    }
    async getForm(tenantId, formId) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT * FROM forms WHERE id = ${formId} AND tenant_id = ${tenantId} LIMIT 1`);
        return result.rows?.[0];
    }
    async getFormBySlug(tenantId, slug) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT * FROM forms WHERE slug = ${slug} AND tenant_id = ${tenantId} AND is_active = true LIMIT 1`);
        return result.rows?.[0];
    }
    async createForm(tenantId, data) {
        const slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-') +
            '-' +
            Date.now().toString(36);
        const result = await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO forms (tenant_id, name, slug, description, fields, settings, submit_button_text, success_message, redirect_url, notification_email)
          VALUES (${tenantId}, ${data.name}, ${slug}, ${data.description || null}, ${JSON.stringify(data.fields)}::jsonb,
                  ${JSON.stringify(data.settings || {})}::jsonb, ${data.submitButtonText || 'Absenden'},
                  ${data.successMessage || 'Vielen Dank!'}, ${data.redirectUrl || null}, ${data.notificationEmail || null})
          RETURNING *`);
        return result.rows?.[0];
    }
    async updateForm(tenantId, formId, data) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `UPDATE forms SET
            name = COALESCE(${data.name}, name), description = COALESCE(${data.description}, description),
            fields = COALESCE(${data.fields ? JSON.stringify(data.fields) : null}::jsonb, fields),
            settings = COALESCE(${data.settings ? JSON.stringify(data.settings) : null}::jsonb, settings),
            submit_button_text = COALESCE(${data.submitButtonText}, submit_button_text),
            success_message = COALESCE(${data.successMessage}, success_message),
            redirect_url = COALESCE(${data.redirectUrl}, redirect_url),
            notification_email = COALESCE(${data.notificationEmail}, notification_email),
            is_active = COALESCE(${data.isActive}, is_active), updated_at = NOW()
          WHERE id = ${formId} AND tenant_id = ${tenantId} RETURNING *`);
        return result.rows?.[0];
    }
    async deleteForm(tenantId, formId) {
        await this.db.execute((0, drizzle_orm_1.sql) `DELETE FROM forms WHERE id = ${formId} AND tenant_id = ${tenantId}`);
        return true;
    }
    async submitForm(tenantId, formSlug, data, ip, ua) {
        const form = await this.getFormBySlug(tenantId, formSlug);
        if (!form)
            throw new Error('Formular nicht gefunden');
        const fields = form.fields;
        for (const field of fields) {
            if (field.required && !data[field.id] && data[field.id] !== false) {
                throw new Error(`"${field.label}" ist ein Pflichtfeld`);
            }
            if (field.type === 'email' &&
                data[field.id] &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[field.id])) {
                throw new Error(`"${field.label}" ist keine gültige E-Mail`);
            }
        }
        const result = await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO form_submissions (tenant_id, form_id, data, ip_address, user_agent)
          VALUES (${tenantId}, ${form.id}, ${JSON.stringify(data)}::jsonb, ${ip || null}, ${ua || null})
          RETURNING *`);
        await this.db.execute((0, drizzle_orm_1.sql) `UPDATE forms SET submissions_count = submissions_count + 1 WHERE id = ${form.id}`);
        if (form.notification_email) {
            try {
                const fieldSummary = Object.entries(data)
                    .map(([key, value]) => `<tr><td style="padding:4px 8px;color:#666;font-size:13px;">${key}</td><td style="padding:4px 8px;font-size:13px;">${value}</td></tr>`)
                    .join('');
                await this.emailService.sendRawEmail({
                    to: form.notification_email,
                    subject: `Neue Formular-Einreichung: ${form.name}`,
                    html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <h2 style="color:#06b6d4;">📋 Neue Einreichung: ${form.name}</h2>
              <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                ${fieldSummary}
              </table>
              <p style="color:#888;font-size:12px;margin-top:24px;">
                Eingegangen am ${new Date().toLocaleString('de-DE')}
              </p>
            </div>
          `,
                });
            }
            catch (error) {
                console.error('⚠️ Form notification email failed:', error instanceof Error ? error.message : error);
            }
        }
        return result.rows?.[0];
    }
    async getSubmissions(tenantId, formId, opts) {
        let query = (0, drizzle_orm_1.sql) `SELECT * FROM form_submissions WHERE tenant_id = ${tenantId} AND form_id = ${formId}`;
        if (opts?.isRead !== undefined)
            query = (0, drizzle_orm_1.sql) `${query} AND is_read = ${opts.isRead}`;
        query = (0, drizzle_orm_1.sql) `${query} ORDER BY created_at DESC LIMIT ${opts?.limit || 50} OFFSET ${opts?.offset || 0}`;
        const result = await this.db.execute(query);
        return result.rows || [];
    }
    async markRead(tenantId, submissionId, read) {
        await this.db.execute((0, drizzle_orm_1.sql) `UPDATE form_submissions SET is_read = ${read} WHERE id = ${submissionId} AND tenant_id = ${tenantId}`);
        return true;
    }
    async starSubmission(tenantId, submissionId, starred) {
        await this.db.execute((0, drizzle_orm_1.sql) `UPDATE form_submissions SET is_starred = ${starred} WHERE id = ${submissionId} AND tenant_id = ${tenantId}`);
        return true;
    }
    async deleteSubmission(tenantId, submissionId) {
        await this.db.execute((0, drizzle_orm_1.sql) `DELETE FROM form_submissions WHERE id = ${submissionId} AND tenant_id = ${tenantId}`);
        return true;
    }
    async getTenantIdBySlug(slug) {
        const [t] = await this.db
            .select({ id: schema_1.tenants.id })
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.slug, slug))
            .limit(1);
        return t?.id || null;
    }
};
exports.FormBuilderService = FormBuilderService;
exports.FormBuilderService = FormBuilderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object, email_service_1.EmailService])
], FormBuilderService);
//# sourceMappingURL=form-builder.service.js.map