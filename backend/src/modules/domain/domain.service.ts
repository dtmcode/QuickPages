/**
 * ==================== DOMAIN SERVICE ====================
 *
 * Handles:
 * - Custom Domain hinzufügen/entfernen
 * - DNS-Verifizierung (TXT Record Check)
 * - SSL-Status Tracking
 * - Nginx Config Generierung
 * - Periodischer DNS-Check (Cron)
 *
 * Flow:
 * 1. Tenant gibt Custom Domain ein → addCustomDomain()
 * 2. System generiert Verification Token
 * 3. Tenant setzt TXT Record: _verify.domain.de → Token
 * 4. Tenant setzt CNAME: domain.de → tenant.deine-platform.de
 * 5. Cron/Manual: verifyDomain() → DNS Check
 * 6. Wenn OK → SSL Certificate anfordern (Let's Encrypt)
 * 7. Nginx Config updaten
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as crypto from 'crypto';
import * as dns from 'dns';
import { promisify } from 'util';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { tenants } from '../../drizzle/schema';
import { eq, and, isNotNull, sql } from 'drizzle-orm';

const resolveTxt = promisify(dns.resolveTxt);
const resolveCname = promisify(dns.resolveCname);
const resolve4 = promisify(dns.resolve4);

@Injectable()
export class DomainService {
  private readonly logger = new Logger(DomainService.name);
  private readonly platformDomain: string;
  private readonly platformIp: string;

  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {
    this.platformDomain = process.env.PLATFORM_DOMAIN || 'deine-platform.de';
    this.platformIp = process.env.PLATFORM_IP || '';
  }

  // ==================== DOMAIN MANAGEMENT ====================

  /**
   * Custom Domain hinzufügen
   * Generiert Verification Token und gibt DNS-Anweisungen zurück
   */
  async addCustomDomain(
    tenantId: string,
    domain: string,
  ): Promise<{
    domain: string;
    verificationToken: string;
    dnsInstructions: DnsInstruction[];
  }> {
    // Domain normalisieren
    domain = this.normalizeDomain(domain);

    // Validierung
    if (!this.isValidDomain(domain)) {
      throw new Error('Ungültige Domain. Beispiel: meine-website.de');
    }

    // Prüfe ob Domain bereits von anderem Tenant genutzt
    const existing = await this.db.execute(
      sql`SELECT id FROM tenants WHERE custom_domain = ${domain} AND id != ${tenantId} LIMIT 1`,
    );
    if ((existing as any).rows?.length > 0) {
      throw new Error(
        'Diese Domain wird bereits von einem anderen Account genutzt',
      );
    }

    // Verification Token generieren
    const token = `verify-${crypto.randomBytes(16).toString('hex')}`;

    // Tenant aktualisieren
    await this.db
      .update(tenants)
      .set({
        customDomain: domain,
        domainVerified: false,
        domainVerificationToken: token,
        dnsRecordsValid: false,
        sslStatus: 'none',
        updatedAt: new Date(),
      } as any)
      .where(eq(tenants.id, tenantId));

    // Event loggen
    await this.logDomainEvent(tenantId, 'domain_added', domain);

    // Tenant Slug holen
    const [tenant] = await this.db
      .select({ slug: tenants.slug })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    return {
      domain,
      verificationToken: token,
      dnsInstructions: this.getDnsInstructions(
        domain,
        token,
        tenant?.slug || '',
      ),
    };
  }

  /**
   * Custom Domain entfernen
   */
  async removeCustomDomain(tenantId: string): Promise<boolean> {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) throw new Error('Tenant nicht gefunden');

    await this.db
      .update(tenants)
      .set({
        customDomain: null,
        domainVerified: false,
        domainVerificationToken: null,
        domainVerifiedAt: null,
        dnsRecordsValid: false,
        sslStatus: 'none',
        sslExpiresAt: null,
        lastDnsCheck: null,
        updatedAt: new Date(),
      } as any)
      .where(eq(tenants.id, tenantId));

    await this.logDomainEvent(
      tenantId,
      'domain_removed',
      (tenant as any).customDomain,
    );
    return true;
  }

  /**
   * DNS-Verifizierung durchführen
   */
  async verifyDomain(tenantId: string): Promise<{
    verified: boolean;
    txtValid: boolean;
    cnameValid: boolean;
    aValid: boolean;
    errors: string[];
  }> {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant || !(tenant as any).customDomain) {
      throw new Error('Keine Custom Domain konfiguriert');
    }

    const domain = (tenant as any).customDomain;
    const token = (tenant as any).domainVerificationToken;
    const errors: string[] = [];

    // 1. TXT Record prüfen: _verify.domain.de → token
    let txtValid = false;
    try {
      const txtRecords = await resolveTxt(`_verify.${domain}`);
      const flatRecords = txtRecords.map((r) => r.join(''));
      txtValid = flatRecords.some((r) => r.includes(token));
      if (!txtValid) {
        errors.push(
          `TXT Record "_verify.${domain}" enthält nicht den Token "${token}"`,
        );
      }
    } catch (err: any) {
      if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
        errors.push(`TXT Record "_verify.${domain}" nicht gefunden`);
      } else {
        errors.push(`DNS-Fehler bei TXT-Abfrage: ${err.message}`);
      }
    }

    // 2. CNAME oder A Record prüfen
    let cnameValid = false;
    let aValid = false;

    // CNAME Check: domain.de → tenant.platform.de
    try {
      const cnameRecords = await resolveCname(domain);
      cnameValid = cnameRecords.some(
        (r) => r.includes(this.platformDomain) || r.includes(tenant.slug),
      );
    } catch {
      // CNAME nicht gefunden → A Record prüfen
    }

    // A Record Check (falls CNAME nicht gesetzt)
    if (!cnameValid && this.platformIp) {
      try {
        const aRecords = await resolve4(domain);
        aValid = aRecords.includes(this.platformIp);
      } catch {
        // A Record nicht gefunden
      }
    }

    if (!cnameValid && !aValid) {
      if (this.platformIp) {
        errors.push(
          `CNAME "${domain}" → "${tenant.slug}.${this.platformDomain}" ODER ` +
            `A Record "${domain}" → "${this.platformIp}" nicht gefunden`,
        );
      } else {
        errors.push(
          `CNAME "${domain}" → "${tenant.slug}.${this.platformDomain}" nicht gefunden`,
        );
      }
    }

    const verified = txtValid && (cnameValid || aValid);

    // Status in DB aktualisieren
    await this.db
      .update(tenants)
      .set({
        domainVerified: verified,
        dnsRecordsValid: cnameValid || aValid,
        lastDnsCheck: new Date(),
        ...(verified && !(tenant as any).domainVerifiedAt
          ? { domainVerifiedAt: new Date() }
          : {}),
        // Wenn verifiziert und noch kein SSL → pending
        ...(verified && (tenant as any).sslStatus === 'none'
          ? { sslStatus: 'pending' }
          : {}),
        updatedAt: new Date(),
      } as any)
      .where(eq(tenants.id, tenantId));

    if (verified) {
      await this.logDomainEvent(tenantId, 'domain_verified', domain);
    }

    return { verified, txtValid, cnameValid, aValid, errors };
  }

  // ==================== DOMAIN STATUS ====================

  /**
   * Holt den aktuellen Domain-Status
   */
  async getDomainStatus(tenantId: string): Promise<{
    customDomain: string | null;
    verified: boolean;
    dnsValid: boolean;
    sslStatus: string;
    sslExpiresAt: Date | null;
    verificationToken: string | null;
    dnsInstructions: DnsInstruction[];
    lastDnsCheck: Date | null;
  }> {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) throw new Error('Tenant nicht gefunden');

    const customDomain = (tenant as any).customDomain;
    const token = (tenant as any).domainVerificationToken;

    return {
      customDomain,
      verified: (tenant as any).domainVerified || false,
      dnsValid: (tenant as any).dnsRecordsValid || false,
      sslStatus: (tenant as any).sslStatus || 'none',
      sslExpiresAt: (tenant as any).sslExpiresAt || null,
      verificationToken: token || null,
      dnsInstructions: customDomain
        ? this.getDnsInstructions(customDomain, token || '', tenant.slug)
        : [],
      lastDnsCheck: (tenant as any).lastDnsCheck || null,
    };
  }

  // ==================== DOMAIN LOOKUP ====================

  /**
   * Findet einen Tenant anhand der Custom Domain
   * Wird vom Public Frontend Middleware genutzt
   */
  async getTenantByDomain(
    domain: string,
  ): Promise<{ slug: string; id: string } | null> {
    domain = this.normalizeDomain(domain);

    const result = await this.db.execute(
      sql`SELECT id, slug FROM tenants 
          WHERE custom_domain = ${domain} 
          AND domain_verified = true 
          AND is_active = true 
          LIMIT 1`,
    );

    const row = (result as any).rows?.[0];
    return row ? { slug: row.slug, id: row.id } : null;
  }

  // ==================== NGINX CONFIG ====================

  /**
   * Generiert Nginx Server-Block für eine Custom Domain
   */
  generateNginxConfig(domain: string, tenantSlug: string): string {
    return `# Auto-generated for ${tenantSlug} → ${domain}
# Date: ${new Date().toISOString()}

server {
    listen 80;
    server_name ${domain} www.${domain};

    # Let's Encrypt ACME Challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect HTTP → HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name ${domain} www.${domain};

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy to Public Frontend
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Tenant-Slug ${tenantSlug};
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # GraphQL
    location /graphql {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`;
  }

  /**
   * Generiert alle Nginx Configs für alle verifizierten Domains
   */
  async generateAllNginxConfigs(): Promise<
    Array<{ domain: string; config: string }>
  > {
    const result = await this.db.execute(
      sql`SELECT slug, custom_domain FROM tenants 
          WHERE custom_domain IS NOT NULL 
          AND domain_verified = true 
          AND is_active = true`,
    );

    return ((result as any).rows || []).map((row: any) => ({
      domain: row.custom_domain,
      config: this.generateNginxConfig(row.custom_domain, row.slug),
    }));
  }

  // ==================== CRON: PERIODIC DNS CHECK ====================

  /**
   * Prüft alle verifizierten Domains periodisch (alle 6 Stunden)
   * Deaktiviert Domains deren DNS nicht mehr stimmt
   */
  @Cron('0 */6 * * *')
  async periodicDnsCheck(): Promise<void> {
    this.logger.log('🔍 Starte periodischen DNS-Check...');

    const domainsToCheck = await this.db.execute(
      sql`SELECT id, slug, custom_domain, domain_verification_token
          FROM tenants 
          WHERE custom_domain IS NOT NULL 
          AND is_active = true`,
    );

    for (const row of (domainsToCheck as any).rows || []) {
      try {
        const result = await this.verifyDomain(row.id);

        if (!result.verified && row.domain_verified) {
          this.logger.warn(
            `⚠️ Domain ${row.custom_domain} (${row.slug}) nicht mehr gültig`,
          );
        }
      } catch (error: any) {
        this.logger.error(
          `DNS-Check fehlgeschlagen für ${row.custom_domain}: ${error.message}`,
        );
      }

      // Rate limiting: 1 Sekunde zwischen Checks
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.logger.log('✅ DNS-Check abgeschlossen');
  }

  // ==================== SSL MANAGEMENT ====================

  /**
   * Markiert SSL als aktiv (wird nach certbot-Erfolg aufgerufen)
   */
  async setSslActive(tenantId: string, expiresAt: Date): Promise<void> {
    await this.db
      .update(tenants)
      .set({
        sslStatus: 'active',
        sslExpiresAt: expiresAt,
        updatedAt: new Date(),
      } as any)
      .where(eq(tenants.id, tenantId));

    await this.logDomainEvent(tenantId, 'ssl_activated', '');
  }

  /**
   * Holt alle Domains die SSL brauchen (für certbot-Script)
   */
  async getDomainsNeedingSsl(): Promise<
    Array<{ tenantId: string; domain: string; slug: string }>
  > {
    const result = await this.db.execute(
      sql`SELECT id, slug, custom_domain FROM tenants
          WHERE custom_domain IS NOT NULL
          AND domain_verified = true
          AND is_active = true
          AND (ssl_status = 'pending' OR ssl_status = 'none' 
               OR ssl_expires_at < NOW() + INTERVAL '14 days')`,
    );

    return ((result as any).rows || []).map((row: any) => ({
      tenantId: row.id,
      domain: row.custom_domain,
      slug: row.slug,
    }));
  }

  // ==================== HELPERS ====================

  private normalizeDomain(domain: string): string {
    return domain
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '')
      .replace(/:\d+$/, '');
  }

  private isValidDomain(domain: string): boolean {
    const regex =
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
    return regex.test(domain) && domain.includes('.') && domain.length <= 253;
  }

  private getDnsInstructions(
    domain: string,
    token: string,
    tenantSlug: string,
  ): DnsInstruction[] {
    const instructions: DnsInstruction[] = [
      {
        type: 'TXT',
        name: `_verify.${domain}`,
        value: token,
        purpose: 'Domain-Verifizierung',
        required: true,
      },
      {
        type: 'CNAME',
        name: domain,
        value: `${tenantSlug}.${this.platformDomain}`,
        purpose: 'Domain-Weiterleitung',
        required: true,
      },
    ];

    // A Record als Alternative wenn Platform IP bekannt
    if (this.platformIp) {
      instructions.push({
        type: 'A',
        name: domain,
        value: this.platformIp,
        purpose: 'Alternative zu CNAME (A Record)',
        required: false,
      });
    }

    // www Redirect
    instructions.push({
      type: 'CNAME',
      name: `www.${domain}`,
      value: domain,
      purpose: 'www-Weiterleitung',
      required: false,
    });

    return instructions;
  }

  private async logDomainEvent(
    tenantId: string,
    eventType: string,
    domain: string,
    details?: string,
  ): Promise<void> {
    try {
      await this.db.execute(
        sql`INSERT INTO domain_events (tenant_id, event_type, domain, details)
            VALUES (${tenantId}, ${eventType}, ${domain}, ${details || null})`,
      );
    } catch {
      // Logging should never fail the main operation
    }
  }
}

// ========== TYPES ==========

export interface DnsInstruction {
  type: 'TXT' | 'CNAME' | 'A';
  name: string;
  value: string;
  purpose: string;
  required: boolean;
}
