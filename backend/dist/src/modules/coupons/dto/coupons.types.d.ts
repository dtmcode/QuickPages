export declare class Coupon {
    id: string;
    tenantId: string;
    code: string;
    type: string;
    value: number;
    minOrderAmount: number | null;
    maxUses: number | null;
    usedCount: number;
    isActive: boolean;
    expiresAt: Date | null;
    applicableModule: string;
    createdAt: Date | null;
    updatedAt: Date | null;
}
export declare class CouponsResponse {
    coupons: Coupon[];
    total: number;
}
export declare class CouponUse {
    id: string;
    couponId: string;
    tenantId: string;
    customerEmail: string;
    referenceId: string | null;
    referenceType: string;
    discountAmount: number;
    usedAt: Date | null;
}
export declare class CouponUsesResponse {
    uses: CouponUse[];
    total: number;
}
export declare class CouponValidationResult {
    valid: boolean;
    message: string | null;
    discountType: string | null;
    discountValue: number | null;
    discountAmount: number | null;
}
