import type { JwtPayload } from '../../core/auth/strategies/jwt.strategy';
import { SupportService } from './support.service';
declare class UpdateTicketInput {
    status?: string;
    priority?: string;
    assignedTo?: string;
}
export declare class SupportResolver {
    private supportService;
    constructor(supportService: SupportService);
    supportTickets(tenantId: string, status?: string, priority?: string): Promise<any>;
    supportStats(tenantId: string): Promise<{
        open: number;
        waiting: number;
        resolved: number;
        closed: number;
        urgent: number;
        total: number;
    }>;
    ticketMessages(ticketId: string, tenantId: string): Promise<any>;
    updateSupportTicket(id: string, input: UpdateTicketInput, tenantId: string): Promise<{
        id: any;
        ticketNumber: any;
        subject: any;
        status: any;
        priority: any;
        customerName: any;
        customerEmail: any;
        assignedTo: any;
        messageCount: number;
        createdAt: any;
        updatedAt: any;
    }>;
    replyToTicket(ticketId: string, content: string, isInternal: boolean, tenantId: string, user: JwtPayload): Promise<{
        id: any;
        ticketId: any;
        authorName: any;
        authorEmail: any;
        content: any;
        isStaff: any;
        isInternal: any;
        createdAt: any;
    }>;
    deleteSupportTicket(id: string, tenantId: string): Promise<boolean>;
}
export {};
