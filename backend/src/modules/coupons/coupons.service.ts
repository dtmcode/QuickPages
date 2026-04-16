// backend\src\modules\coupons\coupons.service.ts

import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { eq, and, desc } from 'drizzle-orm';
import { coupons, couponUses } from '../../drizzle/schema';
import {
  CreateCouponInput,
  UpdateCouponInput,
  ValidateCouponInput,
} from './dto/coupons.input';

type CouponRow = typeof coupons.$inferSelect;
type CouponUseRow = typeof couponUses.$inferSelect;

@Injectable()
export class CouponsService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // ─── Coupons ──────────────────────────────────────────────────────────────

  async getCoupons(tenantId: string) {
    const result = await this.db
      .select()
      .from(coupons)
      .where(eq(coupons.tenantId, tenantId))
      .orderBy(desc(coupons.createdAt));

    return { coupons: result, total: result.length };
  }

  async getCouponById(tenantId: string, id: string): Promise<CouponRow> {
    const [coupon] = await this.db
      .select()
      .from(coupons)
      .where(and(eq(coupons.id, id), eq(coupons.tenantId, tenantId)));

    if (!coupon) throw new NotFoundException('Gutschein nicht gefunden');
    return coupon;
  }

  async createCoupon(tenantId: string, input: CreateCouponInput): Promise<CouponRow> {
    const code = input.code.toUpperCase().trim();

    const [existing] = await this.db
      .select()
      .from(coupons)
      .where(and(eq(coupons.tenantId, tenantId), eq(coupons.code, code)));

    if (existing) {
      throw new ConflictException(`Code "${code}" existiert bereits`);
    }

    const validTypes = ['percent', 'fixed', 'free_shipping'];
    if (!validTypes.includes(input.type)) {
      throw new BadRequestException(`Ungültiger Typ: ${input.type}`);
    }

    if (input.type === 'percent' && (input.value < 1 || input.value > 100)) {
      throw new BadRequestException('Prozentwert muss zwischen 1 und 100 liegen');
    }

    const [created] = await this.db
      .insert(coupons)
      .values({
        tenantId,
        code,
        type: input.type,
        value: input.value,
        minOrderAmount: input.minOrderAmount ?? null,
        maxUses: input.maxUses ?? null,
        expiresAt: input.expiresAt ?? null,
        applicableModule: input.applicableTo ?? 'all',
        isActive: input.isActive ?? true,
        usedCount: 0,
      })
      .returning();

    return created;
  }

  async updateCoupon(
    tenantId: string,
    id: string,
    input: UpdateCouponInput,
  ): Promise<CouponRow> {
    const existing = await this.getCouponById(tenantId, id);

    if (input.code && input.code.toUpperCase() !== existing.code) {
      const newCode = input.code.toUpperCase().trim();
      const [conflict] = await this.db
        .select()
        .from(coupons)
        .where(and(eq(coupons.tenantId, tenantId), eq(coupons.code, newCode)));

      if (conflict) {
        throw new ConflictException(`Code "${newCode}" existiert bereits`);
      }
    }

    const updateData: Partial<typeof coupons.$inferInsert> & { updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (input.code !== undefined) updateData.code = input.code.toUpperCase().trim();
    if (input.type !== undefined) updateData.type = input.type;
    if (input.value !== undefined) updateData.value = input.value;
    if (input.minOrderAmount !== undefined) updateData.minOrderAmount = input.minOrderAmount;
    if (input.maxUses !== undefined) updateData.maxUses = input.maxUses;
    if (input.expiresAt !== undefined) updateData.expiresAt = input.expiresAt;
    if (input.applicableTo !== undefined) updateData.applicableModule = input.applicableTo;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    const [updated] = await this.db
      .update(coupons)
      .set(updateData)
      .where(and(eq(coupons.id, id), eq(coupons.tenantId, tenantId)))
      .returning();

    if (!updated) throw new NotFoundException('Gutschein nicht gefunden');
    return updated;
  }

  async deleteCoupon(tenantId: string, id: string): Promise<boolean> {
    const [deleted] = await this.db
      .delete(coupons)
      .where(and(eq(coupons.id, id), eq(coupons.tenantId, tenantId)))
      .returning();

    if (!deleted) throw new NotFoundException('Gutschein nicht gefunden');
    return true;
  }

  // ─── Validation (Public) ──────────────────────────────────────────────────

  async validateCoupon(tenantId: string, input: ValidateCouponInput) {
    const code = input.code.toUpperCase().trim();

    const [coupon] = await this.db
      .select()
      .from(coupons)
      .where(
        and(
          eq(coupons.tenantId, tenantId),
          eq(coupons.code, code),
          eq(coupons.isActive, true),
        ),
      );

    if (!coupon) {
      return { valid: false, message: 'Ungültiger Gutschein-Code', discountType: null, discountValue: null, discountAmount: null };
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return { valid: false, message: 'Gutschein ist abgelaufen', discountType: null, discountValue: null, discountAmount: null };
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, message: 'Gutschein wurde bereits vollständig eingelöst', discountType: null, discountValue: null, discountAmount: null };
    }

    // applicableModule statt applicableTo
    if (coupon.applicableModule !== 'all' && coupon.applicableModule !== input.module) {
      return { valid: false, message: 'Gutschein gilt nicht für diesen Bereich', discountType: null, discountValue: null, discountAmount: null };
    }

    if (coupon.minOrderAmount !== null && input.orderAmount < coupon.minOrderAmount) {
      const minFormatted = (coupon.minOrderAmount / 100).toFixed(2);
      return { valid: false, message: `Mindestbestellwert von ${minFormatted} € nicht erreicht`, discountType: null, discountValue: null, discountAmount: null };
    }

    let discountAmount = 0;
    if (coupon.type === 'percent') {
      discountAmount = Math.floor((input.orderAmount * coupon.value) / 100);
    } else if (coupon.type === 'fixed') {
      discountAmount = Math.min(coupon.value, input.orderAmount);
    }

    return {
      valid: true,
      message: null,
      discountType: coupon.type,
      discountValue: coupon.value,
      discountAmount,
    };
  }

  // ─── Apply ────────────────────────────────────────────────────────────────

  async applyCoupon(
    tenantId: string,
    code: string,
    orderAmount: number,
    module: string,
    customerEmail: string,
    referenceId: string,
  ): Promise<{ couponId: string; discountAmount: number }> {
    const validation = await this.validateCoupon(tenantId, { code, module, orderAmount });

    if (!validation.valid) {
      throw new BadRequestException(validation.message ?? 'Ungültiger Gutschein');
    }

    const couponCode = code.toUpperCase().trim();
    const [coupon] = await this.db
      .select()
      .from(coupons)
      .where(and(eq(coupons.tenantId, tenantId), eq(coupons.code, couponCode)));

    if (!coupon) throw new NotFoundException('Gutschein nicht gefunden');

    await this.db
      .update(coupons)
      .set({ usedCount: coupon.usedCount + 1, updatedAt: new Date() })
      .where(eq(coupons.id, coupon.id));

    await this.db.insert(couponUses).values({
      couponId: coupon.id,
      tenantId,
      customerEmail,
      referenceId,
      referenceType: module,
      discountAmount: validation.discountAmount ?? 0,
    });

    return {
      couponId: coupon.id,
      discountAmount: validation.discountAmount ?? 0,
    };
  }

  // ─── Coupon Uses ──────────────────────────────────────────────────────────

  async getCouponUses(tenantId: string, couponId: string) {
    await this.getCouponById(tenantId, couponId);

    const uses: CouponUseRow[] = await this.db
      .select()
      .from(couponUses)
      .where(and(eq(couponUses.couponId, couponId), eq(couponUses.tenantId, tenantId)))
      .orderBy(desc(couponUses.usedAt));

    return { uses, total: uses.length };
  }
}