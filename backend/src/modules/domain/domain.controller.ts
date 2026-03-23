/**
 * ==================== DOMAIN CONTROLLER ====================
 * REST endpoints für:
 * - Domain → Tenant Lookup (genutzt von Middleware)
 * - Nginx Config Generation (genutzt von Deploy-Scripts)
 */

import {
  Controller,
  Get,
  Param,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { DomainService } from './domain.service';

@Controller('api/domains')
export class DomainController {
  constructor(private domainService: DomainService) {}

  /**
   * GET /api/domains/lookup?domain=meine-website.de
   *
   * Wird von der Public Frontend Middleware genutzt
   * um Custom Domains zu Tenant-Slugs aufzulösen
   */
  @Get('lookup')
  async lookupDomain(@Query('domain') domain: string) {
    if (!domain) {
      throw new HttpException('domain Parameter fehlt', HttpStatus.BAD_REQUEST);
    }

    const tenant = await this.domainService.getTenantByDomain(domain);

    if (!tenant) {
      throw new HttpException(
        'Domain nicht gefunden oder nicht verifiziert',
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      slug: tenant.slug,
      id: tenant.id,
    };
  }

  /**
   * GET /api/domains/nginx/:domain
   *
   * Generiert Nginx Config für eine spezifische Domain
   * Geschützt: Nur intern oder via API Key nutzen
   */
  @Get('nginx/:domain')
  async getNginxConfig(@Param('domain') domain: string) {
    const tenant = await this.domainService.getTenantByDomain(domain);

    if (!tenant) {
      throw new HttpException('Domain nicht gefunden', HttpStatus.NOT_FOUND);
    }

    const config = this.domainService.generateNginxConfig(domain, tenant.slug);
    return { domain, slug: tenant.slug, config };
  }

  /**
   * GET /api/domains/nginx
   *
   * Generiert alle Nginx Configs für alle verifizierten Domains
   */
  @Get('nginx')
  async getAllNginxConfigs() {
    const configs = await this.domainService.generateAllNginxConfigs();
    return { count: configs.length, configs };
  }

  /**
   * GET /api/domains/ssl/pending
   *
   * Liste aller Domains die ein SSL-Zertifikat brauchen
   * Genutzt vom certbot-Script
   */
  @Get('ssl/pending')
  async getPendingSslDomains() {
    const domains = await this.domainService.getDomainsNeedingSsl();
    return { count: domains.length, domains };
  }
}
