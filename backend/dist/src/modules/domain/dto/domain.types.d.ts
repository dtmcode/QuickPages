export declare class DnsInstructionType {
    type: string;
    name: string;
    value: string;
    purpose: string;
    required: boolean;
}
export declare class DomainStatusResponse {
    customDomain?: string;
    verified: boolean;
    dnsValid: boolean;
    sslStatus: string;
    sslExpiresAt?: Date;
    verificationToken?: string;
    dnsInstructions: DnsInstructionType[];
    lastDnsCheck?: Date;
}
export declare class AddDomainResponse {
    domain: string;
    verificationToken: string;
    dnsInstructions: DnsInstructionType[];
}
export declare class VerifyDomainResponse {
    verified: boolean;
    txtValid: boolean;
    cnameValid: boolean;
    aValid: boolean;
    errors: string[];
}
