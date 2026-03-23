import type { DrizzleDB } from '../../core/database/drizzle.module';
export declare class DomainService {
    private db;
    private readonly logger;
    private readonly platformDomain;
    private readonly platformIp;
    constructor(db: DrizzleDB);
    addCustomDomain(tenantId: string, domain: string): Promise<{
        domain: string;
        verificationToken: string;
        dnsInstructions: DnsInstruction[];
    }>;
    removeCustomDomain(tenantId: string): Promise<boolean>;
    verifyDomain(tenantId: string): Promise<{
        verified: boolean;
        txtValid: boolean;
        cnameValid: boolean;
        aValid: boolean;
        errors: string[];
    }>;
    getDomainStatus(tenantId: string): Promise<{
        customDomain: string | null;
        verified: boolean;
        dnsValid: boolean;
        sslStatus: string;
        sslExpiresAt: Date | null;
        verificationToken: string | null;
        dnsInstructions: DnsInstruction[];
        lastDnsCheck: Date | null;
    }>;
    getTenantByDomain(domain: string): Promise<{
        slug: string;
        id: string;
    } | null>;
    generateNginxConfig(domain: string, tenantSlug: string): string;
    generateAllNginxConfigs(): Promise<Array<{
        domain: string;
        config: string;
    }>>;
    periodicDnsCheck(): Promise<void>;
    setSslActive(tenantId: string, expiresAt: Date): Promise<void>;
    getDomainsNeedingSsl(): Promise<Array<{
        tenantId: string;
        domain: string;
        slug: string;
    }>>;
    private normalizeDomain;
    private isValidDomain;
    private getDnsInstructions;
    private logDomainEvent;
}
export interface DnsInstruction {
    type: 'TXT' | 'CNAME' | 'A';
    name: string;
    value: string;
    purpose: string;
    required: boolean;
}
