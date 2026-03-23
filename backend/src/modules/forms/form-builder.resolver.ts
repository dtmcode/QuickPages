// ==================== form-builder.resolver.ts ====================
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ObjectType,
  Field,
  Int,
  InputType,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../core/auth/decorators/tenant-id.decorator';
import { FormBuilderService } from './form-builder.service';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
class FormType {
  @Field() id: string;
  @Field() name: string;
  @Field() slug: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => GraphQLJSON) fields: any;
  @Field(() => GraphQLJSON, { nullable: true }) settings?: any;
  @Field() submitButtonText: string;
  @Field() successMessage: string;
  @Field({ nullable: true }) redirectUrl?: string;
  @Field({ nullable: true }) notificationEmail?: string;
  @Field() isActive: boolean;
  @Field(() => Int) submissionsCount: number;
  @Field() createdAt: Date;
}

@ObjectType()
class FormSubmissionType {
  @Field() id: string;
  @Field() formId: string;
  @Field(() => GraphQLJSON) data: any;
  @Field() isRead: boolean;
  @Field() isStarred: boolean;
  @Field({ nullable: true }) notes?: string;
  @Field() createdAt: Date;
}

@InputType()
class CreateFormInput {
  @Field() name: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => GraphQLJSON) fields: any;
  @Field(() => GraphQLJSON, { nullable: true }) settings?: any;
  @Field({ nullable: true }) submitButtonText?: string;
  @Field({ nullable: true }) successMessage?: string;
  @Field({ nullable: true }) redirectUrl?: string;
  @Field({ nullable: true }) notificationEmail?: string;
}

@Resolver()
export class FormBuilderResolver {
  constructor(private formService: FormBuilderService) {}

  @Query(() => [FormType])
  @UseGuards(GqlAuthGuard)
  async forms(@TenantId() tid: string) {
    const rows = await this.formService.getForms(tid);
    return rows.map((r: any) => this.mapForm(r));
  }

  @Query(() => FormType, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async form(@Args('id') id: string, @TenantId() tid: string) {
    const r = await this.formService.getForm(tid, id);
    return r ? this.mapForm(r) : null;
  }

  @Mutation(() => FormType)
  @UseGuards(GqlAuthGuard)
  async createForm(
    @Args('input') input: CreateFormInput,
    @TenantId() tid: string,
  ) {
    return this.mapForm(await this.formService.createForm(tid, input));
  }

  @Mutation(() => FormType)
  @UseGuards(GqlAuthGuard)
  async updateForm(
    @Args('id') id: string,
    @Args('input') input: CreateFormInput,
    @TenantId() tid: string,
  ) {
    return this.mapForm(await this.formService.updateForm(tid, id, input));
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteForm(@Args('id') id: string, @TenantId() tid: string) {
    return this.formService.deleteForm(tid, id);
  }

  @Query(() => [FormSubmissionType])
  @UseGuards(GqlAuthGuard)
  async formSubmissions(
    @Args('formId') formId: string,
    @TenantId() tid: string,
  ) {
    const rows = await this.formService.getSubmissions(tid, formId);
    return rows.map((r: any) => ({
      id: r.id,
      formId: r.form_id,
      data: r.data,
      isRead: r.is_read,
      isStarred: r.is_starred,
      notes: r.notes,
      createdAt: r.created_at,
    }));
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async markSubmissionRead(
    @Args('id') id: string,
    @Args('read') read: boolean,
    @TenantId() tid: string,
  ) {
    return this.formService.markRead(tid, id, read);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteSubmission(@Args('id') id: string, @TenantId() tid: string) {
    return this.formService.deleteSubmission(tid, id);
  }

  private mapForm(r: any): FormType {
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      fields: r.fields,
      settings: r.settings,
      submitButtonText: r.submit_button_text,
      successMessage: r.success_message,
      redirectUrl: r.redirect_url,
      notificationEmail: r.notification_email,
      isActive: r.is_active,
      submissionsCount: r.submissions_count,
      createdAt: r.created_at,
    };
  }
}
