// 📂 PFAD: backend/src/modules/support/support.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { tenants } from '../../drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';
import * as crypto from 'crypto';

@Injectable()
export class SupportService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  private generateTicketNumber(): string {
    const now = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
    return `TKT-${now}-${rand}`;
  }

  // ===== TICKETS =====

  async getTickets(tenantId: string, filters?: { status?: string; priority?: string }) {
    let query = sql`
      SELECT t.*, 
        (SELECT COUNT(*) FROM support_messages m WHERE m.ticket_id = t.id AND m.is_internal = false) as message_count,
        (SELECT content FROM support_messages m WHERE m.ticket_id = t.id ORDER BY m.created_at DESC LIMIT 1) as last_message
      FROM support_tickets t
      WHERE t.tenant_id = ${tenantId}
    `;
    if (filters?.status) query = sql`${query} AND t.status = ${filters.status}`;
    if (filters?.priority) query = sql`${query} AND t.priority = ${filters.priority}`;
    query = sql`${query} ORDER BY t.updated_at DESC`;
    const result = await this.db.execute(query);
    return (result as any).rows || [];
  }

  async getTicket(tenantId: string, ticketId: string) {
    const result = await this.db.execute(
      sql`SELECT * FROM support_tickets WHERE id = ${ticketId} AND tenant_id = ${tenantId} LIMIT 1`,
    );
    return (result as any).rows?.[0] || null;
  }

  async getTicketByToken(token: string) {
    const result = await this.db.execute(
      sql`SELECT t.*, s.name as tenant_name FROM support_tickets t
          JOIN tenants s ON t.tenant_id = s.id
          WHERE t.token = ${token} LIMIT 1`,
    );
    return (result as any).rows?.[0] || null;
  }

  async createTicket(tenantId: string, data: {
    subject: string;
    customerName: string;
    customerEmail: string;
    message: string;
    priority?: string;
  }) {
    const ticketNumber = this.generateTicketNumber();
    const token = crypto.randomBytes(24).toString('hex');

    const result = await this.db.execute(
      sql`INSERT INTO support_tickets (tenant_id, ticket_number, subject, customer_name, customer_email, priority, token)
          VALUES (${tenantId}, ${ticketNumber}, ${data.subject}, ${data.customerName}, ${data.customerEmail},
                  ${data.priority || 'normal'}, ${token})
          RETURNING *`,
    );
    const ticket = (result as any).rows?.[0];

    await this.db.execute(
      sql`INSERT INTO support_messages (ticket_id, author_name, author_email, content, is_staff)
          VALUES (${ticket.id}, ${data.customerName}, ${data.customerEmail}, ${data.message}, false)`,
    );

    return ticket;
  }

  async updateTicket(tenantId: string, ticketId: string, data: {
    status?: string;
    priority?: string;
    assignedTo?: string | null;
    tags?: string[];
  }) {
    const result = await this.db.execute(
      sql`UPDATE support_tickets SET
            status = COALESCE(${data.status ?? null}, status),
            priority = COALESCE(${data.priority ?? null}, priority),
            assigned_to = COALESCE(${data.assignedTo ?? null}, assigned_to),
            resolved_at = CASE WHEN ${data.status ?? null} = 'resolved' THEN NOW() ELSE resolved_at END,
            updated_at = NOW()
          WHERE id = ${ticketId} AND tenant_id = ${tenantId}
          RETURNING *`,
    );
    return (result as any).rows?.[0];
  }

  async deleteTicket(tenantId: string, ticketId: string) {
    await this.db.execute(
      sql`DELETE FROM support_tickets WHERE id = ${ticketId} AND tenant_id = ${tenantId}`,
    );
    return true;
  }

  // ===== MESSAGES =====

  async getMessages(ticketId: string, includeInternal = false) {
    const result = await this.db.execute(
      sql`SELECT * FROM support_messages
          WHERE ticket_id = ${ticketId}
          ${includeInternal ? sql`` : sql`AND is_internal = false`}
          ORDER BY created_at ASC`,
    );
    return (result as any).rows || [];
  }

  async addMessage(tenantId: string, ticketId: string, data: {
    authorName: string;
    authorEmail: string;
    content: string;
    isStaff: boolean;
    isInternal?: boolean;
  }) {
    // Verify ticket belongs to tenant
    const ticket = await this.getTicket(tenantId, ticketId);
    if (!ticket) throw new Error('Ticket nicht gefunden');

    const result = await this.db.execute(
      sql`INSERT INTO support_messages (ticket_id, author_name, author_email, content, is_staff, is_internal)
          VALUES (${ticketId}, ${data.authorName}, ${data.authorEmail}, ${data.content},
                  ${data.isStaff}, ${data.isInternal || false})
          RETURNING *`,
    );

    // Update ticket updated_at + reopen if customer replies
    const newStatus = !data.isStaff && ticket.status === 'waiting' ? 'open' : ticket.status;
    await this.db.execute(
      sql`UPDATE support_tickets SET updated_at = NOW(), status = ${newStatus}
          WHERE id = ${ticketId}`,
    );

    return (result as any).rows?.[0];
  }

  async addPublicMessage(token: string, data: {
    authorName: string;
    authorEmail: string;
    content: string;
  }) {
    const ticket = await this.getTicketByToken(token);
    if (!ticket) throw new Error('Ticket nicht gefunden');
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      throw new Error('Dieses Ticket ist bereits geschlossen');
    }

    const result = await this.db.execute(
      sql`INSERT INTO support_messages (ticket_id, author_name, author_email, content, is_staff, is_internal)
          VALUES (${ticket.id}, ${data.authorName}, ${data.authorEmail}, ${data.content}, false, false)
          RETURNING *`,
    );

    await this.db.execute(
      sql`UPDATE support_tickets SET updated_at = NOW(), status = 'open' WHERE id = ${ticket.id}`,
    );

    return (result as any).rows?.[0];
  }

  // ===== STATS =====

  async getStats(tenantId: string) {
    const result = await this.db.execute(
      sql`SELECT
            COUNT(*) FILTER (WHERE status = 'open') as open_count,
            COUNT(*) FILTER (WHERE status = 'waiting') as waiting_count,
            COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
            COUNT(*) FILTER (WHERE status = 'closed') as closed_count,
            COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_count,
            COUNT(*) as total_count
          FROM support_tickets WHERE tenant_id = ${tenantId}`,
    );
    const row = (result as any).rows?.[0] || {};
    return {
      open: parseInt(row.open_count) || 0,
      waiting: parseInt(row.waiting_count) || 0,
      resolved: parseInt(row.resolved_count) || 0,
      closed: parseInt(row.closed_count) || 0,
      urgent: parseInt(row.urgent_count) || 0,
      total: parseInt(row.total_count) || 0,
    };
  }

  async getTenantIdBySlug(slug: string): Promise<string | null> {
    const [t] = await this.db.select({ id: tenants.id }).from(tenants)
      .where(eq(tenants.slug, slug)).limit(1);
    return t?.id || null;
  }
}