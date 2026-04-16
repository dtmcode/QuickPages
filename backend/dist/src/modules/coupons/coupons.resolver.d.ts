import { CouponsService } from './coupons.service';
import { CreateCouponInput, UpdateCouponInput, ValidateCouponInput } from './dto/coupons.input';
export declare class CouponsResolver {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    coupons(tenantId: string): Promise<{
        coupons: {
            id: string;
            tenantId: string;
            code: string;
            description: string | null;
            type: string;
            value: number;
            minOrderAmount: number | null;
            maxUses: number | null;
            usedCount: number;
            applicableModule: string;
            isActive: boolean;
            startsAt: Date | null;
            expiresAt: Date | null;
            createdAt: Date | null;
            updatedAt: Date | null;
        }[];
        total: number;
    }>;
    coupon(tenantId: string, id: string): Promise<{
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
        description: string | null;
        startsAt: Date | null;
    }>;
    couponUses(tenantId: string, couponId: string): Promise<{
        uses: {
            id: string;
            tenantId: string;
            couponId: string;
            customerEmail: string;
            referenceId: string | null;
            referenceType: string | null;
            discountAmount: number;
            usedAt: Date | null;
        }[];
        total: number;
    }>;
    validateCoupon(tenantId: string, input: ValidateCouponInput): Promise<{
        valid: boolean;
        message: string;
        discountType: null;
        discountValue: null;
        discountAmount: null;
    } | {
        valid: boolean;
        message: null;
        discountType: string;
        discountValue: number;
        discountAmount: number;
    }>;
    createCoupon(tenantId: string, input: CreateCouponInput): Promise<{
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
        description: string | null;
        startsAt: Date | null;
    }>;
    updateCoupon(tenantId: string, id: string, input: UpdateCouponInput): Promise<{
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
        description: string | null;
        startsAt: Date | null;
    }>;
    deleteCoupon(tenantId: string, id: string): Promise<boolean>;
}
