/**
 * ==================== DOMAIN RESOLVER ====================
 * GraphQL API für Domain-Verwaltung im Dashboard
 */

import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../core/auth/decorators/tenant-id.decorator';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import type { JwtPayload } from '../../core/auth/strategies/jwt.strategy';
import { DomainService } from './domain.service';
import {
  DomainStatusResponse,
  AddDomainResponse,
  VerifyDomainResponse,
} from './dto/domain.types';

@Resolver()
export class DomainResolver {
  constructor(private domainService: DomainService) {}

  /**
   * Aktueller Domain-Status
   */
  @Query(() => DomainStatusResponse)
  @UseGuards(GqlAuthGuard)
  async domainStatus(
    @TenantId() tenantId: string,
  ): Promise<DomainStatusResponse> {
    const status = await this.domainService.getDomainStatus(tenantId);
    return {
      ...status,
      customDomain: status.customDomain ?? undefined,
      sslExpiresAt: status.sslExpiresAt ?? undefined,
      verificationToken: status.verificationToken ?? undefined,
      lastDnsCheck: status.lastDnsCheck ?? undefined,
    };
  }

  /**
   * Custom Domain hinzufügen
   */
  @Mutation(() => AddDomainResponse)
  @UseGuards(GqlAuthGuard)
  async addCustomDomain(
    @Args('domain') domain: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<AddDomainResponse> {
    if (user.role !== 'owner') {
      throw new Error('Nur der Owner kann Domains verwalten');
    }
    return this.domainService.addCustomDomain(tenantId, domain);
  }

  /**
   * Custom Domain entfernen
   */
  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async removeCustomDomain(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    if (user.role !== 'owner') {
      throw new Error('Nur der Owner kann Domains verwalten');
    }
    return this.domainService.removeCustomDomain(tenantId);
  }

  /**
   * DNS-Verifizierung manuell auslösen
   */
  @Mutation(() => VerifyDomainResponse)
  @UseGuards(GqlAuthGuard)
  async verifyDomain(
    @TenantId() tenantId: string,
  ): Promise<VerifyDomainResponse> {
    return this.domainService.verifyDomain(tenantId);
  }
}
