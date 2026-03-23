import { SupportService } from './support.service';
export declare class SupportPublicController {
    private supportService;
    constructor(supportService: SupportService);
    createTicket(slug: string, body: {
        subject: string;
        customerName: string;
        customerEmail: string;
        message: string;
        priority?: string;
    }): Promise<{
        success: boolean;
        ticketNumber: any;
        token: any;
    }>;
    getTicket(slug: string, token: string): Promise<{
        ticket: any;
        messages: any;
    }>;
    reply(token: string, body: {
        authorName: string;
        authorEmail: string;
        content: string;
    }): Promise<{
        success: boolean;
    }>;
}
