import type { DrizzleDB } from '../../core/database/drizzle.module';
import { coupons } from '../../drizzle/schema';
import { CreateCouponInput, UpdateCouponInput, ValidateCouponInput } from './dto/coupons.input';
type CouponRow = typeof coupons.$inferSelect;
export declare class CouponsService {
    private db;
    constructor(db: DrizzleDB);
    getCoupons(tenantId: string): Promise<{
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
    getCouponById(tenantId: string, id: string): Promise<CouponRow>;
    createCoupon(tenantId: string, input: CreateCouponInput): Promise<CouponRow>;
    updateCoupon(tenantId: string, id: string, input: UpdateCouponInput): Promise<CouponRow>;
    deleteCoupon(tenantId: string, id: string): Promise<boolean>;
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
    applyCoupon(tenantId: string, code: string, orderAmount: number, module: string, customerEmail: string, referenceId: string): Promise<{
        couponId: string;
        discountAmount: number;
    }>;
    getCouponUses(tenantId: string, couponId: string): Promise<{
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
}
export {};
