export declare class CreateCouponInput {
    code: string;
    type: string;
    value: number;
    minOrderAmount?: number;
    maxUses?: number;
    expiresAt?: Date;
    applicableTo?: string;
    isActive?: boolean;
}
export declare class UpdateCouponInput {
    code?: string;
    type?: string;
    value?: number;
    minOrderAmount?: number;
    maxUses?: number;
    expiresAt?: Date;
    applicableTo?: string;
    isActive?: boolean;
}
export declare class ValidateCouponInput {
    code: string;
    module: string;
    orderAmount: number;
}
