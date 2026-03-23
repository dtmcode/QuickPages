import { ConfigService } from '@nestjs/config';
export interface JwtPayload {
    userId: string;
    tenantId: string;
    role: string;
}
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    constructor(configService: ConfigService);
    validate(payload: JwtPayload): Promise<{
        userId: string;
        tenantId: string;
        role: string;
    }>;
}
export {};
