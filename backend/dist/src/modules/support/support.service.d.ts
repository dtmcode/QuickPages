import type { DrizzleDB } from '../../core/database/drizzle.module';
export declare class SupportService {
    private db;
    constructor(db: DrizzleDB);
    private generateTicketNumber;
    getTickets(tenantId: string, filters?: {
        status?: string;
        priority?: string;
    }): Promise<any>;
    getTicket(tenantId: string, ticketId: string): Promise<any>;
    getTicketByToken(token: string): Promise<any>;
    createTicket(tenantId: string, data: {
        subject: string;
        customerName: string;
        customerEmail: string;
        message: string;
        priority?: string;
    }): Promise<any>;
    updateTicket(tenantId: string, ticketId: string, data: {
        status?: string;
        priority?: string;
        assignedTo?: string | null;
        tags?: string[];
    }): Promise<any>;
    deleteTicket(tenantId: string, ticketId: string): Promise<boolean>;
    getMessages(ticketId: string, includeInternal?: boolean): Promise<any>;
    addMessage(tenantId: string, ticketId: string, data: {
        authorName: string;
        authorEmail: string;
        content: string;
        isStaff: boolean;
        isInternal?: boolean;
    }): Promise<any>;
    addPublicMessage(token: string, data: {
        authorName: string;
        authorEmail: string;
        content: string;
    }): Promise<any>;
    getStats(tenantId: string): Promise<{
        open: number;
        waiting: number;
        resolved: number;
        closed: number;
        urgent: number;
        total: number;
    }>;
    getTenantIdBySlug(slug: string): Promise<string | null>;
}
