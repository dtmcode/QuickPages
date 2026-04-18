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
        isActive: boolean;
        createdAt: Date | null;
        updatedAt: Date | null;
        tenantId: string;
        expiresAt: Date | null;
        description: string | null;
        code: string;
        type: string;
        value: number;
        minOrderAmount: number | null;
        maxUses: number | null;
        usedCount: number;
        applicableModule: string;
        startsAt: Date | null;
    }>;
    couponUses(tenantId: string, couponId: string): Promise<{
        uses: {
            id: string;
            tenantId: string;
            customerEmail: string;
            couponId: string;
            discountAmount: number;
            referenceId: string | null;
            referenceType: string | null;
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
        isActive: boolean;
        createdAt: Date | null;
        updatedAt: Date | null;
        tenantId: string;
        expiresAt: Date | null;
        description: string | null;
        code: string;
        type: string;
        value: number;
        minOrderAmount: number | null;
        maxUses: number | null;
        usedCount: number;
        applicableModule: string;
        startsAt: Date | null;
    }>;
    updateCoupon(tenantId: string, id: string, input: UpdateCouponInput): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date | null;
        updatedAt: Date | null;
        tenantId: string;
        expiresAt: Date | null;
        description: string | null;
        code: string;
        type: string;
        value: number;
        minOrderAmount: number | null;
        maxUses: number | null;
        usedCount: number;
        applicableModule: string;
        startsAt: Date | null;
    }>;
    deleteCoupon(tenantId: string, id: string): Promise<boolean>;
}
