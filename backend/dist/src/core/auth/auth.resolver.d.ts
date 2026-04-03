import { AuthService } from './auth.service';
import { AuthResponse, CurrentUserResponse, SuccessResponse } from './dto/auth.types';
import { RegisterInput, LoginInput, RefreshTokenInput, ForgotPasswordInput, ResetPasswordInput, VerifyEmailInput } from './dto/auth.input';
import type { JwtPayload } from './strategies/jwt.strategy';
import type { DrizzleDB } from '../database/drizzle.module';
import { UpdateBrandingInput, BrandingResult } from './dto/auth.types';
export declare class AuthResolver {
    private authService;
    private db;
    constructor(authService: AuthService, db: DrizzleDB);
    hello(): string;
    register(input: RegisterInput): Promise<AuthResponse>;
    login(input: LoginInput): Promise<AuthResponse>;
    refreshToken(input: RefreshTokenInput): Promise<AuthResponse>;
    forgotPassword(input: ForgotPasswordInput): Promise<SuccessResponse>;
    resetPassword(input: ResetPasswordInput): Promise<SuccessResponse>;
    verifyEmail(input: VerifyEmailInput): Promise<SuccessResponse>;
    resendVerificationEmail(currentUser: JwtPayload): Promise<SuccessResponse>;
    me(currentUser: JwtPayload): Promise<CurrentUserResponse>;
    currentTenant(currentUser: JwtPayload): Promise<CurrentUserResponse>;
    updateShopTemplate(template: string, tenantId: string, currentUser: JwtPayload): Promise<CurrentUserResponse>;
    updateBranding(input: UpdateBrandingInput, tenantId: string): Promise<BrandingResult>;
}
