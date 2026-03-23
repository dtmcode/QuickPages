import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { tenants } from '../../drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import { EmailService } from '../../core/email/email.service';
@Injectable()
export class FormBuilderService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private emailService: EmailService, // ← NEU
  ) {}

  // ===== FORMS CRUD =====
  async getForms(tenantId: string) {
    const result = await this.db.execute(
      sql`SELECT * FROM forms WHERE tenant_id = ${tenantId} ORDER BY created_at DESC`,
    );
    return (result as any).rows || [];
  }

  async getForm(tenantId: string, formId: string) {
    const result = await this.db.execute(
      sql`SELECT * FROM forms WHERE id = ${formId} AND tenant_id = ${tenantId} LIMIT 1`,
    );
    return (result as any).rows?.[0];
  }

  async getFormBySlug(tenantId: string, slug: string) {
    const result = await this.db.execute(
      sql`SELECT * FROM forms WHERE slug = ${slug} AND tenant_id = ${tenantId} AND is_active = true LIMIT 1`,
    );
    return (result as any).rows?.[0];
  }

  async createForm(
    tenantId: string,
    data: {
      name: string;
      description?: string;
      fields: any[];
      settings?: any;
      submitButtonText?: string;
      successMessage?: string;
      redirectUrl?: string;
      notificationEmail?: string;
    },
  ) {
    const slug =
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-') +
      '-' +
      Date.now().toString(36);
    const result = await this.db.execute(
      sql`INSERT INTO forms (tenant_id, name, slug, description, fields, settings, submit_button_text, success_message, redirect_url, notification_email)
          VALUES (${tenantId}, ${data.name}, ${slug}, ${data.description || null}, ${JSON.stringify(data.fields)}::jsonb,
                  ${JSON.stringify(data.settings || {})}::jsonb, ${data.submitButtonText || 'Absenden'},
                  ${data.successMessage || 'Vielen Dank!'}, ${data.redirectUrl || null}, ${data.notificationEmail || null})
          RETURNING *`,
    );
    return (result as any).rows?.[0];
  }

  async updateForm(
    tenantId: string,
    formId: string,
    data: Record<string, any>,
  ) {
    const result = await this.db.execute(
      sql`UPDATE forms SET
            name = COALESCE(${data.name}, name), description = COALESCE(${data.description}, description),
            fields = COALESCE(${data.fields ? JSON.stringify(data.fields) : null}::jsonb, fields),
            settings = COALESCE(${data.settings ? JSON.stringify(data.settings) : null}::jsonb, settings),
            submit_button_text = COALESCE(${data.submitButtonText}, submit_button_text),
            success_message = COALESCE(${data.successMessage}, success_message),
            redirect_url = COALESCE(${data.redirectUrl}, redirect_url),
            notification_email = COALESCE(${data.notificationEmail}, notification_email),
            is_active = COALESCE(${data.isActive}, is_active), updated_at = NOW()
          WHERE id = ${formId} AND tenant_id = ${tenantId} RETURNING *`,
    );
    return (result as any).rows?.[0];
  }

  async deleteForm(tenantId: string, formId: string) {
    await this.db.execute(
      sql`DELETE FROM forms WHERE id = ${formId} AND tenant_id = ${tenantId}`,
    );
    return true;
  }

  // ===== SUBMISSIONS =====
  async submitForm(
    tenantId: string,
    formSlug: string,
    data: Record<string, any>,
    ip?: string,
    ua?: string,
  ) {
    const form = await this.getFormBySlug(tenantId, formSlug);
    if (!form) throw new Error('Formular nicht gefunden');

    // Validate required fields
    const fields = form.fields as any[];
    for (const field of fields) {
      if (field.required && !data[field.id] && data[field.id] !== false) {
        throw new Error(`"${field.label}" ist ein Pflichtfeld`);
      }
      if (
        field.type === 'email' &&
        data[field.id] &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[field.id])
      ) {
        throw new Error(`"${field.label}" ist keine gültige E-Mail`);
      }
    }

    // Save submission
    const result = await this.db.execute(
      sql`INSERT INTO form_submissions (tenant_id, form_id, data, ip_address, user_agent)
          VALUES (${tenantId}, ${form.id}, ${JSON.stringify(data)}::jsonb, ${ip || null}, ${ua || null})
          RETURNING *`,
    );

    // Increment counter
    await this.db.execute(
      sql`UPDATE forms SET submissions_count = submissions_count + 1 WHERE id = ${form.id}`,
    );

    // ✅ Email-Benachrichtigung senden
    if (form.notification_email) {
      try {
        const fieldSummary = Object.entries(data)
          .map(
            ([key, value]) =>
              `<tr><td style="padding:4px 8px;color:#666;font-size:13px;">${key}</td><td style="padding:4px 8px;font-size:13px;">${value}</td></tr>`,
          )
          .join('');

        await this.emailService.sendRawEmail({
          to: form.notification_email as string,
          subject: `Neue Formular-Einreichung: ${form.name as string}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <h2 style="color:#06b6d4;">📋 Neue Einreichung: ${form.name as string}</h2>
              <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                ${fieldSummary}
              </table>
              <p style="color:#888;font-size:12px;margin-top:24px;">
                Eingegangen am ${new Date().toLocaleString('de-DE')}
              </p>
            </div>
          `,
        });
      } catch (error: unknown) {
        console.error(
          '⚠️ Form notification email failed:',
          error instanceof Error ? error.message : error,
        );
      }
    }

    return (result as any).rows?.[0];
  }
  async getSubmissions(
    tenantId: string,
    formId: string,
    opts?: { isRead?: boolean; limit?: number; offset?: number },
  ) {
    let query = sql`SELECT * FROM form_submissions WHERE tenant_id = ${tenantId} AND form_id = ${formId}`;
    if (opts?.isRead !== undefined)
      query = sql`${query} AND is_read = ${opts.isRead}`;
    query = sql`${query} ORDER BY created_at DESC LIMIT ${opts?.limit || 50} OFFSET ${opts?.offset || 0}`;
    const result = await this.db.execute(query);
    return (result as any).rows || [];
  }

  async markRead(tenantId: string, submissionId: string, read: boolean) {
    await this.db.execute(
      sql`UPDATE form_submissions SET is_read = ${read} WHERE id = ${submissionId} AND tenant_id = ${tenantId}`,
    );
    return true;
  }

  async starSubmission(
    tenantId: string,
    submissionId: string,
    starred: boolean,
  ) {
    await this.db.execute(
      sql`UPDATE form_submissions SET is_starred = ${starred} WHERE id = ${submissionId} AND tenant_id = ${tenantId}`,
    );
    return true;
  }

  async deleteSubmission(tenantId: string, submissionId: string) {
    await this.db.execute(
      sql`DELETE FROM form_submissions WHERE id = ${submissionId} AND tenant_id = ${tenantId}`,
    );
    return true;
  }

  async getTenantIdBySlug(slug: string): Promise<string | null> {
    const [t] = await this.db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);
    return t?.id || null;
  }
}
