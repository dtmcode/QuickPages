// ==================== form-builder-public.controller.ts ====================
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
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

interface FormRow {
  id: string;
  name: string;
  description: string | null;
  fields: unknown;
  submit_button_text: string;
  success_message: string;
}

@Controller('api/public/:tenant/forms')
export class FormBuilderPublicController {
  constructor(private formService: FormBuilderService) {}

  /** GET /api/public/:tenant/forms/:slug — Formular-Definition laden */
  @Get(':slug')
  async getForm(
    @Param('tenant') tenantSlug: string,
    @Param('slug') slug: string,
  ): Promise<PublicFormResponse> {
    const tid = await this.formService.getTenantIdBySlug(tenantSlug);
    if (!tid) throw new HttpException('Nicht gefunden', HttpStatus.NOT_FOUND);
    const form = (await this.formService.getFormBySlug(tid, slug)) as
      | FormRow
      | undefined;
    if (!form)
      throw new HttpException('Formular nicht gefunden', HttpStatus.NOT_FOUND);
    return {
      id: form.id,
      name: form.name,
      description: form.description,
      fields: form.fields,
      submitButtonText: form.submit_button_text,
      successMessage: form.success_message,
    };
  }

  /** POST /api/public/:tenant/forms/:slug/submit — Formular absenden */
  @Post(':slug/submit')
  async submitForm(
    @Param('tenant') tenantSlug: string,
    @Param('slug') slug: string,
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
  ) {
    const tid = await this.formService.getTenantIdBySlug(tenantSlug);
    if (!tid) throw new HttpException('Nicht gefunden', HttpStatus.NOT_FOUND);
    try {
      await this.formService.submitForm(
        tid,
        slug,
        body as Record<string, any>,
        req.ip,
        req.headers['user-agent'] as string,
      );
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }
}
