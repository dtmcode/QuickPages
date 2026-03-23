export declare enum UserRole {
    OWNER = "owner",
    ADMIN = "admin",
    USER = "user"
}
export declare enum PackageType {
    STARTER = "starter",
    BUSINESS = "business",
    ENTERPRISE = "enterprise"
}
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
    package: PackageType;
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
