"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../drizzle/schema");
let CouponsService = class CouponsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getCoupons(tenantId) {
        const result = await this.db
            .select()
            .from(schema_1.coupons)
            .where((0, drizzle_orm_1.eq)(schema_1.coupons.tenantId, tenantId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.coupons.createdAt));
        return { coupons: result, total: result.length };
    }
    async getCouponById(tenantId, id) {
        const [coupon] = await this.db
            .select()
            .from(schema_1.coupons)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.coupons.id, id), (0, drizzle_orm_1.eq)(schema_1.coupons.tenantId, tenantId)));
        if (!coupon)
            throw new common_1.NotFoundException('Gutschein nicht gefunden');
        return coupon;
    }
    async createCoupon(tenantId, input) {
        const code = input.code.toUpperCase().trim();
        const [existing] = await this.db
            .select()
            .from(schema_1.coupons)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.coupons.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.coupons.code, code)));
        if (existing) {
            throw new common_1.ConflictException(`Code "${code}" existiert bereits`);
        }
        const validTypes = ['percent', 'fixed', 'free_shipping'];
        if (!validTypes.includes(input.type)) {
            throw new common_1.BadRequestException(`Ungültiger Typ: ${input.type}`);
        }
        if (input.type === 'percent' && (input.value < 1 || input.value > 100)) {
            throw new common_1.BadRequestException('Prozentwert muss zwischen 1 und 100 liegen');
        }
        const [created] = await this.db
            .insert(schema_1.coupons)
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
    async updateCoupon(tenantId, id, input) {
        const existing = await this.getCouponById(tenantId, id);
        if (input.code && input.code.toUpperCase() !== existing.code) {
            const newCode = input.code.toUpperCase().trim();
            const [conflict] = await this.db
                .select()
                .from(schema_1.coupons)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.coupons.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.coupons.code, newCode)));
            if (conflict) {
                throw new common_1.ConflictException(`Code "${newCode}" existiert bereits`);
            }
        }
        const updateData = {
            updatedAt: new Date(),
        };
        if (input.code !== undefined)
            updateData.code = input.code.toUpperCase().trim();
        if (input.type !== undefined)
            updateData.type = input.type;
        if (input.value !== undefined)
            updateData.value = input.value;
        if (input.minOrderAmount !== undefined)
            updateData.minOrderAmount = input.minOrderAmount;
        if (input.maxUses !== undefined)
            updateData.maxUses = input.maxUses;
        if (input.expiresAt !== undefined)
            updateData.expiresAt = input.expiresAt;
        if (input.applicableTo !== undefined)
            updateData.applicableModule = input.applicableTo;
        if (input.isActive !== undefined)
            updateData.isActive = input.isActive;
        const [updated] = await this.db
            .update(schema_1.coupons)
            .set(updateData)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.coupons.id, id), (0, drizzle_orm_1.eq)(schema_1.coupons.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Gutschein nicht gefunden');
        return updated;
    }
    async deleteCoupon(tenantId, id) {
        const [deleted] = await this.db
            .delete(schema_1.coupons)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.coupons.id, id), (0, drizzle_orm_1.eq)(schema_1.coupons.tenantId, tenantId)))
            .returning();
        if (!deleted)
            throw new common_1.NotFoundException('Gutschein nicht gefunden');
        return true;
    }
    async validateCoupon(tenantId, input) {
        const code = input.code.toUpperCase().trim();
        const [coupon] = await this.db
            .select()
            .from(schema_1.coupons)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.coupons.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.coupons.code, code), (0, drizzle_orm_1.eq)(schema_1.coupons.isActive, true)));
        if (!coupon) {
            return { valid: false, message: 'Ungültiger Gutschein-Code', discountType: null, discountValue: null, discountAmount: null };
        }
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return { valid: false, message: 'Gutschein ist abgelaufen', discountType: null, discountValue: null, discountAmount: null };
        }
        if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
            return { valid: false, message: 'Gutschein wurde bereits vollständig eingelöst', discountType: null, discountValue: null, discountAmount: null };
        }
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
        }
        else if (coupon.type === 'fixed') {
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
    async applyCoupon(tenantId, code, orderAmount, module, customerEmail, referenceId) {
        const validation = await this.validateCoupon(tenantId, { code, module, orderAmount });
        if (!validation.valid) {
            throw new common_1.BadRequestException(validation.message ?? 'Ungültiger Gutschein');
        }
        const couponCode = code.toUpperCase().trim();
        const [coupon] = await this.db
            .select()
            .from(schema_1.coupons)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.coupons.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.coupons.code, couponCode)));
        if (!coupon)
            throw new common_1.NotFoundException('Gutschein nicht gefunden');
        await this.db
            .update(schema_1.coupons)
            .set({ usedCount: coupon.usedCount + 1, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.coupons.id, coupon.id));
        await this.db.insert(schema_1.couponUses).values({
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
    async getCouponUses(tenantId, couponId) {
        await this.getCouponById(tenantId, couponId);
        const uses = await this.db
            .select()
            .from(schema_1.couponUses)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.couponUses.couponId, couponId), (0, drizzle_orm_1.eq)(schema_1.couponUses.tenantId, tenantId)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.couponUses.usedAt));
        return { uses, total: uses.length };
    }
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map