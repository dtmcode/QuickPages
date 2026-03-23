import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { DrizzleDB } from '../database/drizzle.module';
import { RegisterInput, LoginInput, ForgotPasswordInput, VerifyEmailInput, ResetPasswordInput } from './dto/auth.input';
import { UserRole, PackageType } from './dto/auth.types';
import { EmailService } from '../email/email.service';
import { WebsiteBuilderService } from '../../modules/website-builder/website-builder.service';
export declare class AuthService {
    private db;
    private jwtService;
    private configService;
    private emailService;
    private websiteBuilderService;
    constructor(db: DrizzleDB, jwtService: JwtService, configService: ConfigService, emailService: EmailService, websiteBuilderService: WebsiteBuilderService);
    register(input: RegisterInput): Promise<{
        accessToken: string;
        refreshToken: `${string}-${string}-${string}-${string}-${string}`;
        user: {
            id: string;
            email: string;
            firstName: string | undefined;
            lastName: string | undefined;
            role: UserRole;
            isActive: boolean;
            emailVerified: boolean;
            lastLoginAt: Date | undefined;
            createdAt: Date;
        };
        tenant: {
            id: string;
            name: string;
            slug: string;
            domain: string | undefined;
            package: PackageType;
            isActive: boolean;
            createdAt: Date;
        };
    }>;
    login(input: LoginInput): Promise<{
        accessToken: string;
        refreshToken: `${string}-${string}-${string}-${string}-${string}`;
        user: {
            id: string;
            email: string;
            firstName: string | undefined;
            lastName: string | undefined;
            role: UserRole;
            isActive: boolean;
            emailVerified: boolean;
            lastLoginAt: Date | undefined;
            createdAt: Date;
        };
        tenant: {
            id: string;
            name: string;
            slug: string;
            domain: string | undefined;
            package: PackageType;
            isActive: boolean;
            createdAt: Date;
        };
    }>;
    refreshToken(token: string): Promise<{
        accessToken: string;
        refreshToken: `${string}-${string}-${string}-${string}-${string}`;
        user: {
            id: string;
            email: string;
            firstName: string | undefined;
            lastName: string | undefined;
            role: UserRole;
            isActive: boolean;
            emailVerified: boolean;
            lastLoginAt: Date | undefined;
            createdAt: Date;
        };
        tenant: {
            id: string;
            name: string;
            slug: string;
            domain: string | undefined;
            package: PackageType;
            isActive: boolean;
            createdAt: Date;
        };
    }>;
    forgotPassword(input: ForgotPasswordInput): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(input: ResetPasswordInput): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateTokens;
    sendVerificationEmail(userId: string, email: string, firstName?: string): Promise<void>;
    verifyEmail(input: VerifyEmailInput): Promise<{
        success: boolean;
        message: string;
    }>;
    resendVerificationEmail(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
