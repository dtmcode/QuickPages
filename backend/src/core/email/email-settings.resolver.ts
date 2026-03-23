import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { TenantId } from '../auth/decorators/tenant-id.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy'; // ← import type!
import { EmailSettingsService } from './email-settings.service';
import { EmailService } from './email.service';
import {
  EmailSettings,
  EmailSettingsInput,
  TestEmailResult,
} from './dto/email-settings.types';

@Resolver()
export class EmailSettingsResolver {
  constructor(
    private emailSettingsService: EmailSettingsService,
    private emailService: EmailService,
  ) {}

  @Query(() => EmailSettings, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async emailSettings(@TenantId() tenantId: string) {
    return this.emailSettingsService.getSettings(tenantId);
  }

  @Mutation(() => EmailSettings)
  @UseGuards(GqlAuthGuard)
  async updateEmailSettings(
    @Args('input') input: EmailSettingsInput,
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role !== 'owner') {
      throw new Error('Nur der Owner kann Email-Einstellungen ändern');
    }

    return this.emailSettingsService.upsertSettings(tenantId, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteEmailSettings(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role !== 'owner') {
      throw new Error('Nur der Owner kann Email-Einstellungen löschen');
    }

    await this.emailSettingsService.deleteSettings(tenantId);
    return true;
  }

  @Mutation(() => TestEmailResult)
  @UseGuards(GqlAuthGuard)
  async testEmailSettings(
    @Args('testTo') testTo: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role !== 'owner') {
      throw new Error('Nur der Owner kann Email-Einstellungen testen');
    }

    // Prüfe ob Tenant Settings hat
    const settings = await this.emailSettingsService.getSettings(tenantId);

    if (settings) {
      // Hat Settings → Teste Tenant SMTP
      const testResult =
        await this.emailSettingsService.testConnection(tenantId);

      if (!testResult.success) {
        return testResult;
      }
    }

    // Send test email
    return this.emailService.sendTestEmail(tenantId, testTo);
  }
}
