import type { DrizzleDB } from '../../core/database/drizzle.module';
import { EmailService } from '../../core/email/email.service';
export declare class FormBuilderService {
    private db;
    private emailService;
    constructor(db: DrizzleDB, emailService: EmailService);
    getForms(tenantId: string): Promise<any>;
    getForm(tenantId: string, formId: string): Promise<any>;
    getFormBySlug(tenantId: string, slug: string): Promise<any>;
    createForm(tenantId: string, data: {
        name: string;
        description?: string;
        fields: any[];
        settings?: any;
        submitButtonText?: string;
        successMessage?: string;
        redirectUrl?: string;
        notificationEmail?: string;
    }): Promise<any>;
    updateForm(tenantId: string, formId: string, data: Record<string, any>): Promise<any>;
    deleteForm(tenantId: string, formId: string): Promise<boolean>;
    submitForm(tenantId: string, formSlug: string, data: Record<string, any>, ip?: string, ua?: string): Promise<any>;
    getSubmissions(tenantId: string, formId: string, opts?: {
        isRead?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<any>;
    markRead(tenantId: string, submissionId: string, read: boolean): Promise<boolean>;
    starSubmission(tenantId: string, submissionId: string, starred: boolean): Promise<boolean>;
    deleteSubmission(tenantId: string, submissionId: string): Promise<boolean>;
    getTenantIdBySlug(slug: string): Promise<string | null>;
}
