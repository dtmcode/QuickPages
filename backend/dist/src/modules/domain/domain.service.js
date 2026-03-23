"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DomainService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const crypto = __importStar(require("crypto"));
const dns = __importStar(require("dns"));
const util_1 = require("util");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const resolveTxt = (0, util_1.promisify)(dns.resolveTxt);
const resolveCname = (0, util_1.promisify)(dns.resolveCname);
const resolve4 = (0, util_1.promisify)(dns.resolve4);
let DomainService = DomainService_1 = class DomainService {
    db;
    logger = new common_1.Logger(DomainService_1.name);
    platformDomain;
    platformIp;
    constructor(db) {
        this.db = db;
        this.platformDomain = process.env.PLATFORM_DOMAIN || 'deine-platform.de';
        this.platformIp = process.env.PLATFORM_IP || '';
    }
    async addCustomDomain(tenantId, domain) {
        domain = this.normalizeDomain(domain);
        if (!this.isValidDomain(domain)) {
            throw new Error('Ungültige Domain. Beispiel: meine-website.de');
        }
        const existing = await this.db.execute((0, drizzle_orm_1.sql) `SELECT id FROM tenants WHERE custom_domain = ${domain} AND id != ${tenantId} LIMIT 1`);
        if (existing.rows?.length > 0) {
            throw new Error('Diese Domain wird bereits von einem anderen Account genutzt');
        }
        const token = `verify-${crypto.randomBytes(16).toString('hex')}`;
        await this.db
            .update(schema_1.tenants)
            .set({
            customDomain: domain,
            domainVerified: false,
            domainVerificationToken: token,
            dnsRecordsValid: false,
            sslStatus: 'none',
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId));
        await this.logDomainEvent(tenantId, 'domain_added', domain);
        const [tenant] = await this.db
            .select({ slug: schema_1.tenants.slug })
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId))
            .limit(1);
        return {
            domain,
            verificationToken: token,
            dnsInstructions: this.getDnsInstructions(domain, token, tenant?.slug || ''),
        };
    }
    async removeCustomDomain(tenantId) {
        const [tenant] = await this.db
            .select()
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId))
            .limit(1);
        if (!tenant)
            throw new Error('Tenant nicht gefunden');
        await this.db
            .update(schema_1.tenants)
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
        })
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId));
        await this.logDomainEvent(tenantId, 'domain_removed', tenant.customDomain);
        return true;
    }
    async verifyDomain(tenantId) {
        const [tenant] = await this.db
            .select()
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId))
            .limit(1);
        if (!tenant || !tenant.customDomain) {
            throw new Error('Keine Custom Domain konfiguriert');
        }
        const domain = tenant.customDomain;
        const token = tenant.domainVerificationToken;
        const errors = [];
        let txtValid = false;
        try {
            const txtRecords = await resolveTxt(`_verify.${domain}`);
            const flatRecords = txtRecords.map((r) => r.join(''));
            txtValid = flatRecords.some((r) => r.includes(token));
            if (!txtValid) {
                errors.push(`TXT Record "_verify.${domain}" enthält nicht den Token "${token}"`);
            }
        }
        catch (err) {
            if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
                errors.push(`TXT Record "_verify.${domain}" nicht gefunden`);
            }
            else {
                errors.push(`DNS-Fehler bei TXT-Abfrage: ${err.message}`);
            }
        }
        let cnameValid = false;
        let aValid = false;
        try {
            const cnameRecords = await resolveCname(domain);
            cnameValid = cnameRecords.some((r) => r.includes(this.platformDomain) || r.includes(tenant.slug));
        }
        catch {
        }
        if (!cnameValid && this.platformIp) {
            try {
                const aRecords = await resolve4(domain);
                aValid = aRecords.includes(this.platformIp);
            }
            catch {
            }
        }
        if (!cnameValid && !aValid) {
            if (this.platformIp) {
                errors.push(`CNAME "${domain}" → "${tenant.slug}.${this.platformDomain}" ODER ` +
                    `A Record "${domain}" → "${this.platformIp}" nicht gefunden`);
            }
            else {
                errors.push(`CNAME "${domain}" → "${tenant.slug}.${this.platformDomain}" nicht gefunden`);
            }
        }
        const verified = txtValid && (cnameValid || aValid);
        await this.db
            .update(schema_1.tenants)
            .set({
            domainVerified: verified,
            dnsRecordsValid: cnameValid || aValid,
            lastDnsCheck: new Date(),
            ...(verified && !tenant.domainVerifiedAt
                ? { domainVerifiedAt: new Date() }
                : {}),
            ...(verified && tenant.sslStatus === 'none'
                ? { sslStatus: 'pending' }
                : {}),
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId));
        if (verified) {
            await this.logDomainEvent(tenantId, 'domain_verified', domain);
        }
        return { verified, txtValid, cnameValid, aValid, errors };
    }
    async getDomainStatus(tenantId) {
        const [tenant] = await this.db
            .select()
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId))
            .limit(1);
        if (!tenant)
            throw new Error('Tenant nicht gefunden');
        const customDomain = tenant.customDomain;
        const token = tenant.domainVerificationToken;
        return {
            customDomain,
            verified: tenant.domainVerified || false,
            dnsValid: tenant.dnsRecordsValid || false,
            sslStatus: tenant.sslStatus || 'none',
            sslExpiresAt: tenant.sslExpiresAt || null,
            verificationToken: token || null,
            dnsInstructions: customDomain
                ? this.getDnsInstructions(customDomain, token || '', tenant.slug)
                : [],
            lastDnsCheck: tenant.lastDnsCheck || null,
        };
    }
    async getTenantByDomain(domain) {
        domain = this.normalizeDomain(domain);
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT id, slug FROM tenants 
          WHERE custom_domain = ${domain} 
          AND domain_verified = true 
          AND is_active = true 
          LIMIT 1`);
        const row = result.rows?.[0];
        return row ? { slug: row.slug, id: row.id } : null;
    }
    generateNginxConfig(domain, tenantSlug) {
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
    async generateAllNginxConfigs() {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT slug, custom_domain FROM tenants 
          WHERE custom_domain IS NOT NULL 
          AND domain_verified = true 
          AND is_active = true`);
        return (result.rows || []).map((row) => ({
            domain: row.custom_domain,
            config: this.generateNginxConfig(row.custom_domain, row.slug),
        }));
    }
    async periodicDnsCheck() {
        this.logger.log('🔍 Starte periodischen DNS-Check...');
        const domainsToCheck = await this.db.execute((0, drizzle_orm_1.sql) `SELECT id, slug, custom_domain, domain_verification_token
          FROM tenants 
          WHERE custom_domain IS NOT NULL 
          AND is_active = true`);
        for (const row of domainsToCheck.rows || []) {
            try {
                const result = await this.verifyDomain(row.id);
                if (!result.verified && row.domain_verified) {
                    this.logger.warn(`⚠️ Domain ${row.custom_domain} (${row.slug}) nicht mehr gültig`);
                }
            }
            catch (error) {
                this.logger.error(`DNS-Check fehlgeschlagen für ${row.custom_domain}: ${error.message}`);
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        this.logger.log('✅ DNS-Check abgeschlossen');
    }
    async setSslActive(tenantId, expiresAt) {
        await this.db
            .update(schema_1.tenants)
            .set({
            sslStatus: 'active',
            sslExpiresAt: expiresAt,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId));
        await this.logDomainEvent(tenantId, 'ssl_activated', '');
    }
    async getDomainsNeedingSsl() {
        const result = await this.db.execute((0, drizzle_orm_1.sql) `SELECT id, slug, custom_domain FROM tenants
          WHERE custom_domain IS NOT NULL
          AND domain_verified = true
          AND is_active = true
          AND (ssl_status = 'pending' OR ssl_status = 'none' 
               OR ssl_expires_at < NOW() + INTERVAL '14 days')`);
        return (result.rows || []).map((row) => ({
            tenantId: row.id,
            domain: row.custom_domain,
            slug: row.slug,
        }));
    }
    normalizeDomain(domain) {
        return domain
            .toLowerCase()
            .trim()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/\/.*$/, '')
            .replace(/:\d+$/, '');
    }
    isValidDomain(domain) {
        const regex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;
        return regex.test(domain) && domain.includes('.') && domain.length <= 253;
    }
    getDnsInstructions(domain, token, tenantSlug) {
        const instructions = [
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
        if (this.platformIp) {
            instructions.push({
                type: 'A',
                name: domain,
                value: this.platformIp,
                purpose: 'Alternative zu CNAME (A Record)',
                required: false,
            });
        }
        instructions.push({
            type: 'CNAME',
            name: `www.${domain}`,
            value: domain,
            purpose: 'www-Weiterleitung',
            required: false,
        });
        return instructions;
    }
    async logDomainEvent(tenantId, eventType, domain, details) {
        try {
            await this.db.execute((0, drizzle_orm_1.sql) `INSERT INTO domain_events (tenant_id, event_type, domain, details)
            VALUES (${tenantId}, ${eventType}, ${domain}, ${details || null})`);
        }
        catch {
        }
    }
};
exports.DomainService = DomainService;
__decorate([
    (0, schedule_1.Cron)('0 */6 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DomainService.prototype, "periodicDnsCheck", null);
exports.DomainService = DomainService = DomainService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], DomainService);
//# sourceMappingURL=domain.service.js.map