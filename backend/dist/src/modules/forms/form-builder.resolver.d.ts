import { FormBuilderService } from './form-builder.service';
declare class FormType {
    id: string;
    name: string;
    slug: string;
    description?: string;
    fields: any;
    settings?: any;
    submitButtonText: string;
    successMessage: string;
    redirectUrl?: string;
    notificationEmail?: string;
    isActive: boolean;
    submissionsCount: number;
    createdAt: Date;
}
declare class CreateFormInput {
    name: string;
    description?: string;
    fields: any;
    settings?: any;
    submitButtonText?: string;
    successMessage?: string;
    redirectUrl?: string;
    notificationEmail?: string;
}
export declare class FormBuilderResolver {
    private formService;
    constructor(formService: FormBuilderService);
    forms(tid: string): Promise<any>;
    form(id: string, tid: string): Promise<FormType | null>;
    createForm(input: CreateFormInput, tid: string): Promise<FormType>;
    updateForm(id: string, input: CreateFormInput, tid: string): Promise<FormType>;
    deleteForm(id: string, tid: string): Promise<boolean>;
    formSubmissions(formId: string, tid: string): Promise<any>;
    markSubmissionRead(id: string, read: boolean, tid: string): Promise<boolean>;
    deleteSubmission(id: string, tid: string): Promise<boolean>;
    private mapForm;
}
export {};
