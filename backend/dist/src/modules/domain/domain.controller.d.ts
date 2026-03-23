import { DomainService } from './domain.service';
export declare class DomainController {
    private domainService;
    constructor(domainService: DomainService);
    lookupDomain(domain: string): Promise<{
        slug: string;
        id: string;
    }>;
    getNginxConfig(domain: string): Promise<{
        domain: string;
        slug: string;
        config: string;
    }>;
    getAllNginxConfigs(): Promise<{
        count: number;
        configs: {
            domain: string;
            config: string;
        }[];
    }>;
    getPendingSslDomains(): Promise<{
        count: number;
        domains: {
            tenantId: string;
            domain: string;
            slug: string;
        }[];
    }>;
}
