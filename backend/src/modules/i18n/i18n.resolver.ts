// ==================== i18n.resolver.ts ====================
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ObjectType,
  Field,
  InputType,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../core/auth/decorators/tenant-id.decorator';
import { I18nService } from './i18n.service';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
class LocaleSettingsType {
  @Field() defaultLocale: string;
  @Field(() => [String]) enabledLocales: string[];
  @Field(() => [String]) supportedLocales: string[];
}

@ObjectType()
class TranslationType {
  @Field() entityType: string;
  @Field() entityId: string;
  @Field() locale: string;
  @Field() field: string;
  @Field() value: string;
}

@Resolver()
export class I18nResolver {
  constructor(private i18nService: I18nService) {}

  @Query(() => LocaleSettingsType)
  @UseGuards(GqlAuthGuard)
  async localeSettings(@TenantId() tid: string) {
    return this.i18nService.getLocaleSettings(tid);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async updateLocaleSettings(
    @Args('defaultLocale') dl: string,
    @Args({ name: 'enabledLocales', type: () => [String] }) el: string[],
    @TenantId() tid: string,
  ) {
    return this.i18nService.updateLocaleSettings(tid, dl, el);
  }

  @Query(() => [TranslationType])
  @UseGuards(GqlAuthGuard)
  async translations(
    @Args('entityType') et: string,
    @Args('entityId') eid: string,
    @Args('locale', { nullable: true }) locale: string,
    @TenantId() tid: string,
  ) {
    const rows = await this.i18nService.getTranslations(tid, et, eid, locale);
    return rows.map((r: any) => ({
      entityType: r.entity_type,
      entityId: r.entity_id,
      locale: r.locale,
      field: r.field,
      value: r.value,
    }));
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async setTranslation(
    @Args('entityType') et: string,
    @Args('entityId') eid: string,
    @Args('locale') locale: string,
    @Args('field') field: string,
    @Args('value') value: string,
    @TenantId() tid: string,
  ) {
    return this.i18nService.setTranslation(tid, et, eid, locale, field, value);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async setTranslationsBatch(
    @Args('entityType') et: string,
    @Args('entityId') eid: string,
    @Args('locale') locale: string,
    @Args({ name: 'translations', type: () => GraphQLJSON })
    translations: Record<string, string>,
    @TenantId() tid: string,
  ) {
    return this.i18nService.setTranslationsBatch(
      tid,
      et,
      eid,
      locale,
      translations,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteTranslations(
    @Args('entityType') et: string,
    @Args('entityId') eid: string,
    @Args('locale', { nullable: true }) locale: string,
    @TenantId() tid: string,
  ) {
    return this.i18nService.deleteTranslations(tid, et, eid, locale);
  }

  @Query(() => GraphQLJSON)
  @UseGuards(GqlAuthGuard)
  async uiTranslations(
    @Args('locale') locale: string,
    @TenantId() tid: string,
  ) {
    return this.i18nService.getUiTranslations(tid, locale);
  }

  @Query(() => GraphQLJSON)
  @UseGuards(GqlAuthGuard)
  async allUiTranslations(@TenantId() tid: string) {
    return this.i18nService.getAllUiTranslations(tid);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async setUiTranslation(
    @Args('locale') locale: string,
    @Args('key') key: string,
    @Args('value') value: string,
    @TenantId() tid: string,
  ) {
    return this.i18nService.setUiTranslation(tid, locale, key, value);
  }
}
