export declare class RegisterInput {
    companyName: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    package?: string;
}
export declare class LoginInput {
    email: string;
    password: string;
}
export declare class RefreshTokenInput {
    refreshToken: string;
}
export declare class ForgotPasswordInput {
    email: string;
}
export declare class ResetPasswordInput {
    token: string;
    newPassword: string;
}
export declare class VerifyEmailInput {
    token: string;
}
