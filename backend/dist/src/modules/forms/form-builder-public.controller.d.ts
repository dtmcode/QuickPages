import type { Request } from 'express';
import { FormBuilderService } from './form-builder.service';
interface PublicFormResponse {
    id: string;
    name: string;
    description: string | null;
    fields: unknown;
    submitButtonText: string;
    successMessage: string;
}
export declare class FormBuilderPublicController {
    private formService;
    constructor(formService: FormBuilderService);
    getForm(tenantSlug: string, slug: string): Promise<PublicFormResponse>;
    submitForm(tenantSlug: string, slug: string, body: Record<string, unknown>, req: Request): Promise<{
        success: boolean;
    }>;
}
export {};
