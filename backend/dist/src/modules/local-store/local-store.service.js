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
exports.LocalStoreService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../drizzle/schema");
let LocalStoreService = class LocalStoreService {
    db;
    constructor(db) {
        this.db = db;
    }
    toSlug(name) {
        if (!name)
            return `product-${Date.now()}`;
        return name
            .toLowerCase()
            .replace(/ä/g, 'ae')
            .replace(/ö/g, 'oe')
            .replace(/ü/g, 'ue')
            .replace(/ß/g, 'ss')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    generatePickupCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    getDayName(day) {
        return ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][day];
    }
    async getSettings(tenantId) {
        const [settings] = await this.db
            .select()
            .from(schema_1.localStoreSettings)
            .where((0, drizzle_orm_1.eq)(schema_1.localStoreSettings.tenantId, tenantId));
        if (!settings) {
            const [created] = await this.db
                .insert(schema_1.localStoreSettings)
                .values({ tenantId })
                .returning();
            return created;
        }
        return settings;
    }
    async updateSettings(tenantId, input) {
        const existing = await this.getSettings(tenantId);
        const [updated] = await this.db
            .update(schema_1.localStoreSettings)
            .set({ ...input, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.localStoreSettings.id, existing.id))
            .returning();
        return updated;
    }
    async getProducts(tenantId, onlyAvailable = false) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.localProducts.tenantId, tenantId)];
        if (onlyAvailable)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.localProducts.isAvailable, true));
        const result = await this.db
            .select()
            .from(schema_1.localProducts)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.localProducts.isFeatured), (0, drizzle_orm_1.asc)(schema_1.localProducts.name));
        return { products: result, total: result.length };
    }
    async getProductById(tenantId, id) {
        const [product] = await this.db
            .select()
            .from(schema_1.localProducts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localProducts.id, id), (0, drizzle_orm_1.eq)(schema_1.localProducts.tenantId, tenantId)));
        if (!product)
            throw new common_1.NotFoundException('Produkt nicht gefunden');
        return product;
    }
    async createProduct(tenantId, input) {
        let slug = this.toSlug(input.name);
        const existing = await this.db
            .select()
            .from(schema_1.localProducts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localProducts.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.localProducts.slug, slug)));
        if (existing.length > 0)
            slug = `${slug}-${Date.now()}`;
        const [product] = await this.db
            .insert(schema_1.localProducts)
            .values({
            tenantId,
            ...input,
            slug,
            unit: input.unit ?? 'Stück',
            images: input.images ?? [],
            stock: input.stock ?? 0,
            isUnlimited: input.isUnlimited ?? false,
            isOrganic: input.isOrganic ?? false,
            isRegional: input.isRegional ?? false,
        })
            .returning();
        return product;
    }
    async updateProduct(tenantId, id, input) {
        const updateData = { ...input, updatedAt: new Date() };
        if (input.name)
            updateData.slug = this.toSlug(input.name);
        const [updated] = await this.db
            .update(schema_1.localProducts)
            .set(updateData)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localProducts.id, id), (0, drizzle_orm_1.eq)(schema_1.localProducts.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Produkt nicht gefunden');
        return updated;
    }
    async deleteProduct(tenantId, id) {
        const [deleted] = await this.db
            .delete(schema_1.localProducts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localProducts.id, id), (0, drizzle_orm_1.eq)(schema_1.localProducts.tenantId, tenantId)))
            .returning();
        if (!deleted)
            throw new common_1.NotFoundException('Produkt nicht gefunden');
        return true;
    }
    async getDeals(tenantId, onlyActive = false) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.localDeals.tenantId, tenantId)];
        if (onlyActive) {
            const now = new Date();
            conditions.push((0, drizzle_orm_1.eq)(schema_1.localDeals.isActive, true));
            conditions.push((0, drizzle_orm_1.lte)(schema_1.localDeals.startsAt, now));
            conditions.push((0, drizzle_orm_1.gte)(schema_1.localDeals.endsAt, now));
        }
        const result = await this.db
            .select()
            .from(schema_1.localDeals)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.localDeals.createdAt));
        const dealsWithProducts = await Promise.all(result.map(async (deal) => {
            if (!deal.localProductId)
                return { ...deal, product: null };
            const [product] = await this.db
                .select()
                .from(schema_1.localProducts)
                .where((0, drizzle_orm_1.eq)(schema_1.localProducts.id, deal.localProductId));
            return { ...deal, product: product ?? null };
        }));
        return { deals: dealsWithProducts, total: dealsWithProducts.length };
    }
    async createDeal(tenantId, input) {
        if (new Date(input.endsAt) <= new Date(input.startsAt)) {
            throw new common_1.BadRequestException('Enddatum muss nach dem Startdatum liegen');
        }
        const [deal] = await this.db
            .insert(schema_1.localDeals)
            .values({ tenantId, ...input })
            .returning();
        return deal;
    }
    async updateDeal(tenantId, id, input) {
        const [updated] = await this.db
            .update(schema_1.localDeals)
            .set(input)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localDeals.id, id), (0, drizzle_orm_1.eq)(schema_1.localDeals.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Deal nicht gefunden');
        return updated;
    }
    async deleteDeal(tenantId, id) {
        const [deleted] = await this.db
            .delete(schema_1.localDeals)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localDeals.id, id), (0, drizzle_orm_1.eq)(schema_1.localDeals.tenantId, tenantId)))
            .returning();
        if (!deleted)
            throw new common_1.NotFoundException('Deal nicht gefunden');
        return true;
    }
    async getPickupSlots(tenantId) {
        const result = await this.db
            .select()
            .from(schema_1.localPickupSlots)
            .where((0, drizzle_orm_1.eq)(schema_1.localPickupSlots.tenantId, tenantId))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.localPickupSlots.dayOfWeek), (0, drizzle_orm_1.asc)(schema_1.localPickupSlots.startTime));
        return { slots: result, total: result.length };
    }
    async createPickupSlot(tenantId, input) {
        const [slot] = await this.db
            .insert(schema_1.localPickupSlots)
            .values({ tenantId, ...input, maxOrders: input.maxOrders ?? 5 })
            .returning();
        return slot;
    }
    async updatePickupSlot(tenantId, id, input) {
        const [updated] = await this.db
            .update(schema_1.localPickupSlots)
            .set(input)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localPickupSlots.id, id), (0, drizzle_orm_1.eq)(schema_1.localPickupSlots.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Slot nicht gefunden');
        return updated;
    }
    async deletePickupSlot(tenantId, id) {
        await this.db
            .delete(schema_1.localPickupSlots)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localPickupSlots.id, id), (0, drizzle_orm_1.eq)(schema_1.localPickupSlots.tenantId, tenantId)));
        return true;
    }
    async getAvailablePickupSlots(tenantId, days = 7) {
        const slots = await this.db
            .select()
            .from(schema_1.localPickupSlots)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localPickupSlots.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.localPickupSlots.isActive, true)));
        const available = [];
        const today = new Date();
        for (let d = 0; d < days; d++) {
            const date = new Date(today);
            date.setDate(today.getDate() + d);
            const dow = date.getDay();
            const dateStr = date.toISOString().split('T')[0];
            const daySlots = slots.filter(s => s.dayOfWeek === dow);
            for (const slot of daySlots) {
                const [{ count }] = await this.db
                    .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                    .from(schema_1.localOrders)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localOrders.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.localOrders.pickupSlotId, slot.id), (0, drizzle_orm_1.eq)(schema_1.localOrders.pickupDate, dateStr), (0, drizzle_orm_1.sql) `status NOT IN ('cancelled')`));
                const booked = Number(count);
                const free = slot.maxOrders - booked;
                if (free > 0) {
                    available.push({
                        slotId: slot.id,
                        date: dateStr,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        available: free,
                        maxOrders: slot.maxOrders,
                    });
                }
            }
        }
        return available;
    }
    async getOrders(tenantId, status) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.localOrders.tenantId, tenantId)];
        if (status)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.localOrders.status, status));
        const result = await this.db
            .select()
            .from(schema_1.localOrders)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.localOrders.createdAt));
        return { orders: result, total: result.length };
    }
    async getOrderById(tenantId, id) {
        const [order] = await this.db
            .select()
            .from(schema_1.localOrders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localOrders.id, id), (0, drizzle_orm_1.eq)(schema_1.localOrders.tenantId, tenantId)));
        if (!order)
            throw new common_1.NotFoundException('Bestellung nicht gefunden');
        const items = await this.db
            .select()
            .from(schema_1.localOrderItems)
            .where((0, drizzle_orm_1.eq)(schema_1.localOrderItems.localOrderId, id));
        return { ...order, items };
    }
    async createOrder(tenantId, input) {
        const settings = await this.getSettings(tenantId);
        if (input.orderType === 'pickup' && input.pickupSlotId && input.pickupDate) {
            const [{ count }] = await this.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.localOrders)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localOrders.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.localOrders.pickupSlotId, input.pickupSlotId), (0, drizzle_orm_1.eq)(schema_1.localOrders.pickupDate, input.pickupDate), (0, drizzle_orm_1.sql) `status NOT IN ('cancelled')`));
            const [slot] = await this.db
                .select()
                .from(schema_1.localPickupSlots)
                .where((0, drizzle_orm_1.eq)(schema_1.localPickupSlots.id, input.pickupSlotId));
            if (slot && Number(count) >= slot.maxOrders) {
                throw new common_1.BadRequestException('Dieser Abholtermin ist bereits ausgebucht');
            }
        }
        let discountAmount = 0;
        let couponId;
        if (input.couponCode) {
            const [coupon] = await this.db
                .select()
                .from(schema_1.coupons)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.coupons.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.coupons.code, input.couponCode.toUpperCase()), (0, drizzle_orm_1.eq)(schema_1.coupons.isActive, true)));
            if (!coupon)
                throw new common_1.BadRequestException('Ungültiger Gutschein-Code');
            if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
                throw new common_1.BadRequestException('Gutschein bereits aufgebraucht');
            }
            if (coupon.expiresAt && new Date() > coupon.expiresAt) {
                throw new common_1.BadRequestException('Gutschein abgelaufen');
            }
            couponId = coupon.id;
        }
        let subtotal = 0;
        const resolvedItems = [];
        for (const item of input.items) {
            const [product] = await this.db
                .select()
                .from(schema_1.localProducts)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localProducts.id, item.localProductId), (0, drizzle_orm_1.eq)(schema_1.localProducts.tenantId, tenantId)));
            if (!product)
                throw new common_1.NotFoundException(`Produkt ${item.localProductId} nicht gefunden`);
            if (!product.isAvailable)
                throw new common_1.BadRequestException(`${product.name} ist nicht verfügbar`);
            if (!product.isUnlimited && product.stock !== null && product.stock < item.quantity) {
                throw new common_1.BadRequestException(`Nicht genug Lagerbestand für ${product.name}`);
            }
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;
            resolvedItems.push({
                localProductId: product.id,
                productName: product.name,
                productPrice: product.price,
                unit: product.unit,
                quantity: item.quantity,
                total: itemTotal,
            });
            if (!product.isUnlimited && product.stock !== null) {
                await this.db
                    .update(schema_1.localProducts)
                    .set({ stock: product.stock - item.quantity })
                    .where((0, drizzle_orm_1.eq)(schema_1.localProducts.id, product.id));
            }
        }
        if (settings.minOrderAmount && subtotal < settings.minOrderAmount) {
            throw new common_1.BadRequestException(`Mindestbestellwert: ${(settings.minOrderAmount / 100).toFixed(2)} €`);
        }
        if (couponId) {
            const [coupon] = await this.db.select().from(schema_1.coupons).where((0, drizzle_orm_1.eq)(schema_1.coupons.id, couponId));
            if (coupon.type === 'percent') {
                discountAmount = Math.floor(subtotal * coupon.value / 100);
            }
            else if (coupon.type === 'fixed') {
                discountAmount = Math.min(coupon.value, subtotal);
            }
            await this.db
                .update(schema_1.coupons)
                .set({ usedCount: coupon.usedCount + 1 })
                .where((0, drizzle_orm_1.eq)(schema_1.coupons.id, couponId));
        }
        const total = subtotal - discountAmount;
        const orderNumber = `LO-${Date.now().toString().slice(-8)}`;
        const pickupCode = this.generatePickupCode();
        const [order] = await this.db
            .insert(schema_1.localOrders)
            .values({
            tenantId,
            orderNumber,
            orderType: input.orderType,
            pickupSlotId: input.pickupSlotId,
            pickupDate: input.pickupDate,
            pickupCode,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
            deliveryAddress: input.deliveryAddress,
            notes: input.notes,
            status: 'pending',
            subtotal,
            discountAmount,
            total,
            paymentMethod: input.paymentMethod ?? 'cash_on_pickup',
            couponId,
        })
            .returning();
        if (resolvedItems.length > 0) {
            await this.db.insert(schema_1.localOrderItems).values(resolvedItems.map(i => ({ localOrderId: order.id, ...i })));
        }
        if (couponId && input.customerEmail) {
            await this.db.insert(schema_1.couponUses).values({
                couponId,
                tenantId,
                customerEmail: input.customerEmail,
                referenceId: order.id,
                referenceType: 'local',
                discountAmount,
            });
        }
        return this.getOrderById(tenantId, order.id);
    }
    async updateOrderStatus(tenantId, id, input) {
        const valid = ['pending', 'confirmed', 'ready', 'picked_up', 'cancelled'];
        if (!valid.includes(input.status)) {
            throw new common_1.BadRequestException(`Ungültiger Status: ${input.status}`);
        }
        const [updated] = await this.db
            .update(schema_1.localOrders)
            .set({ status: input.status, updatedAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localOrders.id, id), (0, drizzle_orm_1.eq)(schema_1.localOrders.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Bestellung nicht gefunden');
        return this.getOrderById(tenantId, id);
    }
    async confirmPickup(tenantId, orderId, pickupCode) {
        const [order] = await this.db
            .select()
            .from(schema_1.localOrders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localOrders.id, orderId), (0, drizzle_orm_1.eq)(schema_1.localOrders.tenantId, tenantId)));
        if (!order)
            throw new common_1.NotFoundException('Bestellung nicht gefunden');
        if (order.pickupCode !== pickupCode)
            throw new common_1.BadRequestException('Falscher Abholcode');
        if (order.pickupCodeUsed)
            throw new common_1.BadRequestException('Abholcode bereits verwendet');
        await this.db
            .update(schema_1.localOrders)
            .set({
            pickupCodeUsed: true,
            pickupConfirmedAt: new Date(),
            status: 'picked_up',
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.localOrders.id, orderId));
        return true;
    }
    async getPublicStore(tenantId) {
        const [settings] = await this.db
            .select()
            .from(schema_1.localStoreSettings)
            .where((0, drizzle_orm_1.eq)(schema_1.localStoreSettings.tenantId, tenantId));
        const products = await this.db
            .select()
            .from(schema_1.localProducts)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localProducts.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.localProducts.isAvailable, true)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.localProducts.isFeatured), (0, drizzle_orm_1.asc)(schema_1.localProducts.name));
        const now = new Date();
        const activeDeals = await this.db
            .select()
            .from(schema_1.localDeals)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.localDeals.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.localDeals.isActive, true), (0, drizzle_orm_1.lte)(schema_1.localDeals.startsAt, now), (0, drizzle_orm_1.gte)(schema_1.localDeals.endsAt, now)));
        const availableSlots = await this.getAvailablePickupSlots(tenantId, 14);
        return { settings, products, deals: activeDeals, availableSlots };
    }
};
exports.LocalStoreService = LocalStoreService;
exports.LocalStoreService = LocalStoreService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], LocalStoreService);
//# sourceMappingURL=local-store.service.js.map