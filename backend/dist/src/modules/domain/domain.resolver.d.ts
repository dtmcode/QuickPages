import type { JwtPayload } from '../../core/auth/strategies/jwt.strategy';
import { DomainService } from './domain.service';
import { DomainStatusResponse, AddDomainResponse, VerifyDomainResponse } from './dto/domain.types';
export declare class DomainResolver {
    private domainService;
    constructor(domainService: DomainService);
    domainStatus(tenantId: string): Promise<DomainStatusResponse>;
    addCustomDomain(domain: string, tenantId: string, user: JwtPayload): Promise<AddDomainResponse>;
    removeCustomDomain(tenantId: string, user: JwtPayload): Promise<boolean>;
    verifyDomain(tenantId: string): Promise<VerifyDomainResponse>;
}
