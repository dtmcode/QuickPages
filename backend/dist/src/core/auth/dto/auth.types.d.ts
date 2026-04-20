export declare enum UserRole {
    OWNER = "owner",
    ADMIN = "admin",
    USER = "user"
}
export type PackageType = string;
export declare class User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    isActive: boolean;
    emailVerified: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
}
export declare class Tenant {
    id: string;
    name: string;
    slug: string;
    domain?: string;
    package: string;
    shopTemplate?: string;
    isActive: boolean;
    createdAt: Date;
}
export declare class AuthResponse {
    user: User;
    tenant: Tenant;
    accessToken: string;
    refreshToken: string;
}
export declare class CurrentUserResponse {
    user: User;
    tenant: Tenant;
}
export declare class SuccessResponse {
    success: boolean;
    message: string;
}
export declare class UpdateBrandingInput {
    primaryColor?: string;
    logoUrl?: string;
    platformName?: string;
}
export declare class BrandingResult {
    primaryColor?: string;
    logoUrl?: string;
}
