"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto = __importStar(require("crypto"));
let SupportService = class SupportService {
    db;
    constructor(db) {
        this.db = db;
    }
    generateTicketNumber() {
        const now = Date.now().toString(36).toUpperCase();
        const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
        return `TKT-${now}-${rand}`;
    }
    async getTickets(tenantId, filters) {
        let query = (0, drizzle_orm_1.sql) `
      SELECT t.*, 
        (SELECT COUNT(*) FROM support_messages m WHERE m.ticket_id = t.id AND m.is_internal = false) as message_count,
        (SELECT content FROM support_messages m WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_message
      FROM support_tickets t
      WHERE t.tenant_id = ${tenantId}
    `;
        if (filters?.status)
            query = (0, drizzle_orm_1.sql) `${query} AND t.status = ${filters.status}`;
        if (filters?.priority)
            query = (0, drizzle_orm_1.sql) `${query} AND t.priority = ${filters.priority}`;
        query = (0, drizzle_orm_1.sql) `${query} ORDER BY t.updated_at DESC`;
        const result = await this.db.execute(query);
        return result.rows || [];
    }
    async getTicket(tenantId, ticketId) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT * FROM support_tickets WHERE id = ${ticketId} AND tenant_id = ${tenantId} LIMIT 1`);
        return result.rows?.[0] || null;
    }
    async getTicketByToken(token) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT t.*, s.name as tenant_name FROM support_tickets t
          JOIN tenants s ON t.tenant_id = s.id
          WHERE t.token = ${token} LIMIT 1`);
        return result.rows?.[0] || null;
    }
    async createTicket(tenantId, data) {
        const ticketNumber = this.generateTicketNumber();
        const token = crypto.randomBytes(24).toString('hex');
        const result = await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO support_tickets (tenant_id, ticket_number, subject, customer_name, customer_email, priority, token)
          VALUES (${tenantId}, ${ticketNumber}, ${data.subject}, ${data.customerName}, ${data.customerEmail},
                  ${data.priority || 'normal'}, ${token})
          RETURNING *`);
        const ticket = result.rows?.[0];
        await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO support_messages (ticket_id, author_name, author_email, content, is_staff)
          VALUES (${ticket.id}, ${data.customerName}, ${data.customerEmail}, ${data.message}, false)`);
        return ticket;
    }
    async updateTicket(tenantId, ticketId, data) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `UPDATE support_tickets SET
            status = COALESCE(${data.status ?? null}, status),
            priority = COALESCE(${data.priority ?? null}, priority),
            assigned_to = COALESCE(${data.assignedTo ?? null}, assigned_to),
            resolved_at = CASE WHEN ${data.status ?? null} = 'resolved' THEN NOW() ELSE resolved_at END,
            updated_at = NOW()
          WHERE id = ${ticketId} AND tenant_id = ${tenantId}
          RETURNING *`);
        return result.rows?.[0];
    }
    async deleteTicket(tenantId, ticketId) {
        await this.db.execute((0, drizzle_orm_1.sql) `DELETE FROM support_tickets WHERE id = ${ticketId} AND tenant_id = ${tenantId}`);
        return true;
    }
    async getMessages(ticketId, includeInternal = false) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT * FROM support_messages
          WHERE ticket_id = ${ticketId}
          ${includeInternal ? (0, drizzle_orm_1.sql) `` : (0, drizzle_orm_1.sql) `AND is_internal = false`}
          ORDER BY created_at ASC`);
        return result.rows || [];
    }
    async addMessage(tenantId, ticketId, data) {
        const ticket = await this.getTicket(tenantId, ticketId);
        if (!ticket)
            throw new Error('Ticket nicht gefunden');
        const result = await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO support_messages (ticket_id, author_name, author_email, content, is_staff, is_internal)
          VALUES (${ticketId}, ${data.authorName}, ${data.authorEmail}, ${data.content},
                  ${data.isStaff}, ${data.isInternal || false})
          RETURNING *`);
        const newStatus = !data.isStaff && ticket.status === 'waiting' ? 'open' : ticket.status;
        await this.db.execute((0, drizzle_orm_1.sql) `UPDATE support_tickets SET updated_at = NOW(), status = ${newStatus}
          WHERE id = ${ticketId}`);
        return result.rows?.[0];
    }
    async addPublicMessage(token, data) {
        const ticket = await this.getTicketByToken(token);
        if (!ticket)
            throw new Error('Ticket nicht gefunden');
        if (ticket.status === 'resolved' || ticket.status === 'closed') {
            throw new Error('Dieses Ticket ist bereits geschlossen');
        }
        const result = await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO support_messages (ticket_id, author_name, author_email, content, is_staff, is_internal)
          VALUES (${ticket.id}, ${data.authorName}, ${data.authorEmail}, ${data.content}, false, false)
          RETURNING *`);
        await this.db.execute((0, drizzle_orm_1.sql) `UPDATE support_tickets SET updated_at = NOW(), status = 'open' WHERE id = ${ticket.id}`);
        return result.rows?.[0];
    }
    async getStats(tenantId) {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT
            COUNT(*) FILTER (WHERE status = 'open') as open_count,
            COUNT(*) FILTER (WHERE status = 'waiting') as waiting_count,
            COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
            COUNT(*) FILTER (WHERE status = 'closed') as closed_count,
            COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_count,
            COUNT(*) as total_count
          FROM support_tickets WHERE tenant_id = ${tenantId}`);
        const row = result.rows?.[0] || {};
        return {
            open: parseInt(row.open_count) || 0,
            waiting: parseInt(row.waiting_count) || 0,
            resolved: parseInt(row.resolved_count) || 0,
            closed: parseInt(row.closed_count) || 0,
            urgent: parseInt(row.urgent_count) || 0,
            total: parseInt(row.total_count) || 0,
        };
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
exports.SupportService = SupportService;
exports.SupportService = SupportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], SupportService);
//# sourceMappingURL=support.service.js.map