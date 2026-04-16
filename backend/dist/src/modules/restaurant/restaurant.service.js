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
exports.RestaurantService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../../drizzle/schema");
let RestaurantService = class RestaurantService {
    db;
    constructor(db) {
        this.db = db;
    }
    toSlug(name) {
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
    async getSettings(tenantId) {
        const [settings] = await this.db
            .select()
            .from(schema_1.restaurantSettings)
            .where((0, drizzle_orm_1.eq)(schema_1.restaurantSettings.tenantId, tenantId));
        if (!settings) {
            const [created] = await this.db
                .insert(schema_1.restaurantSettings)
                .values({ tenantId })
                .returning();
            return created;
        }
        return settings;
    }
    async updateSettings(tenantId, input) {
        const existing = await this.getSettings(tenantId);
        const [updated] = await this.db
            .update(schema_1.restaurantSettings)
            .set({ ...input, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.restaurantSettings.id, existing.id))
            .returning();
        return updated;
    }
    async getTables(tenantId) {
        const result = await this.db
            .select()
            .from(schema_1.restaurantTables)
            .where((0, drizzle_orm_1.eq)(schema_1.restaurantTables.tenantId, tenantId))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.restaurantTables.number));
        return { tables: result, total: result.length };
    }
    async createTable(tenantId, input) {
        const qrCode = `${tenantId}/table/${input.number}`;
        const [table] = await this.db
            .insert(schema_1.restaurantTables)
            .values({ tenantId, ...input, qrCode, capacity: input.capacity ?? 4 })
            .returning();
        return table;
    }
    async updateTable(tenantId, id, input) {
        const [updated] = await this.db
            .update(schema_1.restaurantTables)
            .set(input)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.restaurantTables.id, id), (0, drizzle_orm_1.eq)(schema_1.restaurantTables.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Tisch nicht gefunden');
        return updated;
    }
    async deleteTable(tenantId, id) {
        const [deleted] = await this.db
            .delete(schema_1.restaurantTables)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.restaurantTables.id, id), (0, drizzle_orm_1.eq)(schema_1.restaurantTables.tenantId, tenantId)))
            .returning();
        if (!deleted)
            throw new common_1.NotFoundException('Tisch nicht gefunden');
        return true;
    }
    async getMenuCategories(tenantId) {
        const result = await this.db
            .select()
            .from(schema_1.menuCategories)
            .where((0, drizzle_orm_1.eq)(schema_1.menuCategories.tenantId, tenantId))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.menuCategories.position));
        return { categories: result, total: result.length };
    }
    async createMenuCategory(tenantId, input) {
        const slug = this.toSlug(input.name);
        const [category] = await this.db
            .insert(schema_1.menuCategories)
            .values({ tenantId, ...input, slug })
            .returning();
        return category;
    }
    async updateMenuCategory(tenantId, id, input) {
        const updateData = { ...input, updatedAt: new Date() };
        if (input.name)
            updateData.slug = this.toSlug(input.name);
        const [updated] = await this.db
            .update(schema_1.menuCategories)
            .set(updateData)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.menuCategories.id, id), (0, drizzle_orm_1.eq)(schema_1.menuCategories.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Kategorie nicht gefunden');
        return updated;
    }
    async deleteMenuCategory(tenantId, id) {
        const [deleted] = await this.db
            .delete(schema_1.menuCategories)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.menuCategories.id, id), (0, drizzle_orm_1.eq)(schema_1.menuCategories.tenantId, tenantId)))
            .returning();
        if (!deleted)
            throw new common_1.NotFoundException('Kategorie nicht gefunden');
        return true;
    }
    async getMenuItems(tenantId, categoryId) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.menuItems.tenantId, tenantId)];
        if (categoryId)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.menuItems.categoryId, categoryId));
        const result = await this.db
            .select()
            .from(schema_1.menuItems)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.menuItems.position));
        return { items: result, total: result.length };
    }
    async getMenuItemWithModifiers(tenantId, id) {
        const [item] = await this.db
            .select()
            .from(schema_1.menuItems)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.menuItems.id, id), (0, drizzle_orm_1.eq)(schema_1.menuItems.tenantId, tenantId)));
        if (!item)
            throw new common_1.NotFoundException('Menü-Item nicht gefunden');
        const groups = await this.db
            .select()
            .from(schema_1.menuModifierGroups)
            .where((0, drizzle_orm_1.eq)(schema_1.menuModifierGroups.menuItemId, id))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.menuModifierGroups.position));
        const groupsWithModifiers = await Promise.all(groups.map(async (group) => {
            const mods = await this.db
                .select()
                .from(schema_1.menuModifiers)
                .where((0, drizzle_orm_1.eq)(schema_1.menuModifiers.groupId, group.id))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.menuModifiers.position));
            return { ...group, modifiers: mods };
        }));
        return { ...item, modifierGroups: groupsWithModifiers };
    }
    async createMenuItem(tenantId, input) {
        const slug = this.toSlug(input.name);
        const [item] = await this.db
            .insert(schema_1.menuItems)
            .values({
            tenantId,
            ...input,
            slug,
            images: input.images ?? [],
            allergens: input.allergens ?? [],
        })
            .returning();
        return item;
    }
    async updateMenuItem(tenantId, id, input) {
        const updateData = { ...input, updatedAt: new Date() };
        if (input.name)
            updateData.slug = this.toSlug(input.name);
        const [updated] = await this.db
            .update(schema_1.menuItems)
            .set(updateData)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.menuItems.id, id), (0, drizzle_orm_1.eq)(schema_1.menuItems.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Menü-Item nicht gefunden');
        return updated;
    }
    async deleteMenuItem(tenantId, id) {
        const [deleted] = await this.db
            .delete(schema_1.menuItems)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.menuItems.id, id), (0, drizzle_orm_1.eq)(schema_1.menuItems.tenantId, tenantId)))
            .returning();
        if (!deleted)
            throw new common_1.NotFoundException('Menü-Item nicht gefunden');
        return true;
    }
    async createModifierGroup(tenantId, input) {
        const [group] = await this.db
            .insert(schema_1.menuModifierGroups)
            .values({ tenantId, ...input, maxSelections: input.maxSelections ?? 1 })
            .returning();
        return group;
    }
    async updateModifierGroup(tenantId, id, input) {
        const [updated] = await this.db
            .update(schema_1.menuModifierGroups)
            .set(input)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.menuModifierGroups.id, id), (0, drizzle_orm_1.eq)(schema_1.menuModifierGroups.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Modifier-Gruppe nicht gefunden');
        return updated;
    }
    async deleteModifierGroup(tenantId, id) {
        await this.db
            .delete(schema_1.menuModifierGroups)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.menuModifierGroups.id, id), (0, drizzle_orm_1.eq)(schema_1.menuModifierGroups.tenantId, tenantId)));
        return true;
    }
    async createModifier(tenantId, input) {
        const [modifier] = await this.db
            .insert(schema_1.menuModifiers)
            .values({ tenantId, ...input, priceModifier: input.priceModifier ?? 0 })
            .returning();
        return modifier;
    }
    async updateModifier(tenantId, id, input) {
        const [updated] = await this.db
            .update(schema_1.menuModifiers)
            .set(input)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.menuModifiers.id, id), (0, drizzle_orm_1.eq)(schema_1.menuModifiers.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Modifier nicht gefunden');
        return updated;
    }
    async deleteModifier(tenantId, id) {
        await this.db
            .delete(schema_1.menuModifiers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.menuModifiers.id, id), (0, drizzle_orm_1.eq)(schema_1.menuModifiers.tenantId, tenantId)));
        return true;
    }
    async getFoodOrders(tenantId, status) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.foodOrders.tenantId, tenantId)];
        if (status)
            conditions.push((0, drizzle_orm_1.eq)(schema_1.foodOrders.status, status));
        const result = await this.db
            .select()
            .from(schema_1.foodOrders)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.foodOrders.createdAt));
        return { orders: result, total: result.length };
    }
    async getFoodOrderById(tenantId, id) {
        const [order] = await this.db
            .select()
            .from(schema_1.foodOrders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.foodOrders.id, id), (0, drizzle_orm_1.eq)(schema_1.foodOrders.tenantId, tenantId)));
        if (!order)
            throw new common_1.NotFoundException('Bestellung nicht gefunden');
        const items = await this.db
            .select()
            .from(schema_1.foodOrderItems)
            .where((0, drizzle_orm_1.eq)(schema_1.foodOrderItems.foodOrderId, id));
        const history = await this.db
            .select()
            .from(schema_1.foodOrderStatusHistory)
            .where((0, drizzle_orm_1.eq)(schema_1.foodOrderStatusHistory.foodOrderId, id))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.foodOrderStatusHistory.createdAt));
        return {
            ...order,
            items: items.map((i) => ({
                ...i,
                selectedModifiers: i.selectedModifiers ?? [],
            })),
            statusHistory: history,
        };
    }
    async createFoodOrder(tenantId, input) {
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
            const [menuItem] = await this.db
                .select()
                .from(schema_1.menuItems)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.menuItems.id, item.menuItemId), (0, drizzle_orm_1.eq)(schema_1.menuItems.tenantId, tenantId)));
            if (!menuItem)
                throw new common_1.NotFoundException(`Menü-Item ${item.menuItemId} nicht gefunden`);
            const modifiersTotal = (item.selectedModifiers ?? []).reduce((sum, m) => sum + m.priceModifier, 0);
            const itemTotal = (menuItem.price + modifiersTotal) * item.quantity;
            subtotal += itemTotal;
            resolvedItems.push({
                menuItemId: item.menuItemId,
                menuItemName: menuItem.name,
                menuItemPrice: menuItem.price,
                quantity: item.quantity,
                selectedModifiers: item.selectedModifiers ?? [],
                notes: item.notes,
                total: itemTotal,
            });
        }
        if (couponId) {
            const [coupon] = await this.db
                .select()
                .from(schema_1.coupons)
                .where((0, drizzle_orm_1.eq)(schema_1.coupons.id, couponId));
            if (coupon.type === 'percent') {
                discountAmount = Math.floor((subtotal * coupon.value) / 100);
            }
            else if (coupon.type === 'fixed') {
                discountAmount = Math.min(coupon.value, subtotal);
            }
            await this.db
                .update(schema_1.coupons)
                .set({ usedCount: coupon.usedCount + 1 })
                .where((0, drizzle_orm_1.eq)(schema_1.coupons.id, couponId));
        }
        const settings = await this.getSettings(tenantId);
        const deliveryFee = input.orderType === 'delivery' ? (settings.deliveryFee ?? 0) : 0;
        const tax = 0;
        const total = subtotal + deliveryFee + tax - discountAmount;
        const orderNumber = `FO-${Date.now().toString().slice(-8)}`;
        const pickupCode = input.orderType !== 'delivery' ? this.generatePickupCode() : undefined;
        const estimatedMinutes = input.orderType === 'delivery'
            ? (settings.estimatedDeliveryTime ?? 45)
            : (settings.estimatedPickupTime ?? 20);
        const estimatedReadyAt = new Date(Date.now() + estimatedMinutes * 60 * 1000);
        const [order] = await this.db
            .insert(schema_1.foodOrders)
            .values({
            tenantId,
            orderNumber,
            orderType: input.orderType,
            tableId: input.tableId,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
            deliveryAddress: input.deliveryAddress,
            notes: input.notes,
            status: 'new',
            subtotal,
            tax,
            deliveryFee,
            discountAmount,
            total,
            pickupCode,
            paymentMethod: input.paymentMethod ?? 'cash',
            couponId,
            estimatedReadyAt,
        })
            .returning();
        if (resolvedItems.length > 0) {
            await this.db
                .insert(schema_1.foodOrderItems)
                .values(resolvedItems.map((i) => ({ foodOrderId: order.id, ...i })));
        }
        if (couponId && input.customerEmail) {
            await this.db.insert(schema_1.couponUses).values({
                couponId,
                tenantId,
                customerEmail: input.customerEmail,
                referenceId: order.id,
                referenceType: 'restaurant',
                discountAmount,
            });
        }
        await this.db.insert(schema_1.foodOrderStatusHistory).values({
            foodOrderId: order.id,
            tenantId,
            status: 'new',
            note: 'Bestellung eingegangen',
        });
        return this.getFoodOrderById(tenantId, order.id);
    }
    async updateFoodOrderStatus(tenantId, id, input) {
        const validStatuses = [
            'new',
            'accepted',
            'preparing',
            'ready',
            'on_the_way',
            'delivered',
            'cancelled',
        ];
        if (!validStatuses.includes(input.status)) {
            throw new common_1.BadRequestException(`Ungültiger Status: ${input.status}`);
        }
        const [updated] = await this.db
            .update(schema_1.foodOrders)
            .set({ status: input.status, updatedAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.foodOrders.id, id), (0, drizzle_orm_1.eq)(schema_1.foodOrders.tenantId, tenantId)))
            .returning();
        if (!updated)
            throw new common_1.NotFoundException('Bestellung nicht gefunden');
        await this.db.insert(schema_1.foodOrderStatusHistory).values({
            foodOrderId: id,
            tenantId,
            status: input.status,
            note: input.note,
        });
        return this.getFoodOrderById(tenantId, id);
    }
    async confirmPickup(tenantId, orderId, pickupCode) {
        const [order] = await this.db
            .select()
            .from(schema_1.foodOrders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.foodOrders.id, orderId), (0, drizzle_orm_1.eq)(schema_1.foodOrders.tenantId, tenantId)));
        if (!order)
            throw new common_1.NotFoundException('Bestellung nicht gefunden');
        if (order.pickupCode !== pickupCode)
            throw new common_1.BadRequestException('Falscher Abholcode');
        if (order.pickupCodeUsed)
            throw new common_1.BadRequestException('Abholcode bereits verwendet');
        await this.db
            .update(schema_1.foodOrders)
            .set({ pickupCodeUsed: true, status: 'delivered', updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.foodOrders.id, orderId));
        await this.db.insert(schema_1.foodOrderStatusHistory).values({
            foodOrderId: orderId,
            tenantId,
            status: 'delivered',
            note: `Abholung bestätigt (Code: ${pickupCode})`,
        });
        return true;
    }
    async getPublicMenu(tenantId) {
        const cats = await this.db
            .select()
            .from(schema_1.menuCategories)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.menuCategories.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.menuCategories.isActive, true)))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.menuCategories.position));
        const result = await Promise.all(cats.map(async (cat) => {
            const items = await this.db
                .select()
                .from(schema_1.menuItems)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.menuItems.categoryId, cat.id), (0, drizzle_orm_1.eq)(schema_1.menuItems.isAvailable, true)))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.menuItems.position));
            const itemsWithModifiers = await Promise.all(items.map((item) => this.getMenuItemWithModifiers(tenantId, item.id)));
            return { ...cat, items: itemsWithModifiers };
        }));
        return result;
    }
};
exports.RestaurantService = RestaurantService;
exports.RestaurantService = RestaurantService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], RestaurantService);
//# sourceMappingURL=restaurant.service.js.map