import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { eq, and, desc, asc, count } from 'drizzle-orm';
import {
  restaurantSettings,
  restaurantTables,
  menuCategories,
  menuItems,
  menuModifierGroups,
  menuModifiers,
  foodOrders,
  foodOrderItems,
  foodOrderStatusHistory,
  coupons,
  couponUses,
} from '../../drizzle/schema';
import {
  CreateRestaurantTableInput,
  UpdateRestaurantTableInput,
  UpdateRestaurantSettingsInput,
  CreateMenuCategoryInput,
  UpdateMenuCategoryInput,
  CreateMenuItemInput,
  UpdateMenuItemInput,
  CreateModifierGroupInput,
  UpdateModifierGroupInput,
  CreateModifierInput,
  UpdateModifierInput,
  CreateFoodOrderInput,
  UpdateFoodOrderStatusInput,
} from './dto/restaurant.input';

@Injectable()
export class RestaurantService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // ─── Slug Helper ─────────────────────────────────────────────────────────────

  private toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private generatePickupCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // ─── Settings ─────────────────────────────────────────────────────────────────

  async getSettings(tenantId: string) {
    const [settings] = await this.db
      .select()
      .from(restaurantSettings)
      .where(eq(restaurantSettings.tenantId, tenantId));

    if (!settings) {
      // Auto-create defaults
      const [created] = await this.db
        .insert(restaurantSettings)
        .values({ tenantId })
        .returning();
      return created;
    }
    return settings;
  }

  async updateSettings(tenantId: string, input: UpdateRestaurantSettingsInput) {
    const existing = await this.getSettings(tenantId);
    const [updated] = await this.db
      .update(restaurantSettings)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(restaurantSettings.id, existing.id))
      .returning();
    return updated;
  }

  // ─── Tables ───────────────────────────────────────────────────────────────────

  async getTables(tenantId: string) {
    const result = await this.db
      .select()
      .from(restaurantTables)
      .where(eq(restaurantTables.tenantId, tenantId))
      .orderBy(asc(restaurantTables.number));
    return { tables: result, total: result.length };
  }

  async createTable(tenantId: string, input: CreateRestaurantTableInput) {
    const qrCode = `${tenantId}/table/${input.number}`;
    const [table] = await this.db
      .insert(restaurantTables)
      .values({ tenantId, ...input, qrCode, capacity: input.capacity ?? 4 })
      .returning();
    return table;
  }

  async updateTable(
    tenantId: string,
    id: string,
    input: UpdateRestaurantTableInput,
  ) {
    const [updated] = await this.db
      .update(restaurantTables)
      .set(input)
      .where(
        and(
          eq(restaurantTables.id, id),
          eq(restaurantTables.tenantId, tenantId),
        ),
      )
      .returning();
    if (!updated) throw new NotFoundException('Tisch nicht gefunden');
    return updated;
  }

  async deleteTable(tenantId: string, id: string) {
    const [deleted] = await this.db
      .delete(restaurantTables)
      .where(
        and(
          eq(restaurantTables.id, id),
          eq(restaurantTables.tenantId, tenantId),
        ),
      )
      .returning();
    if (!deleted) throw new NotFoundException('Tisch nicht gefunden');
    return true;
  }

  // ─── Menu Categories ──────────────────────────────────────────────────────────

  async getMenuCategories(tenantId: string) {
    const result = await this.db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.tenantId, tenantId))
      .orderBy(asc(menuCategories.position));
    return { categories: result, total: result.length };
  }

  async createMenuCategory(tenantId: string, input: CreateMenuCategoryInput) {
    const slug = this.toSlug(input.name);
    const [category] = await this.db
      .insert(menuCategories)
      .values({ tenantId, ...input, slug })
      .returning();
    return category;
  }

  async updateMenuCategory(
    tenantId: string,
    id: string,
    input: UpdateMenuCategoryInput,
  ) {
    const updateData: any = { ...input, updatedAt: new Date() };
    if (input.name) updateData.slug = this.toSlug(input.name);
    const [updated] = await this.db
      .update(menuCategories)
      .set(updateData)
      .where(
        and(eq(menuCategories.id, id), eq(menuCategories.tenantId, tenantId)),
      )
      .returning();
    if (!updated) throw new NotFoundException('Kategorie nicht gefunden');
    return updated;
  }

  async deleteMenuCategory(tenantId: string, id: string) {
    const [deleted] = await this.db
      .delete(menuCategories)
      .where(
        and(eq(menuCategories.id, id), eq(menuCategories.tenantId, tenantId)),
      )
      .returning();
    if (!deleted) throw new NotFoundException('Kategorie nicht gefunden');
    return true;
  }

  // ─── Menu Items ───────────────────────────────────────────────────────────────

  async getMenuItems(tenantId: string, categoryId?: string) {
    const conditions = [eq(menuItems.tenantId, tenantId)];
    if (categoryId) conditions.push(eq(menuItems.categoryId, categoryId));

    const result = await this.db
      .select()
      .from(menuItems)
      .where(and(...conditions))
      .orderBy(asc(menuItems.position));
    return { items: result, total: result.length };
  }

  async getMenuItemWithModifiers(tenantId: string, id: string) {
    const [item] = await this.db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.id, id), eq(menuItems.tenantId, tenantId)));
    if (!item) throw new NotFoundException('Menü-Item nicht gefunden');

    const groups = await this.db
      .select()
      .from(menuModifierGroups)
      .where(eq(menuModifierGroups.menuItemId, id))
      .orderBy(asc(menuModifierGroups.position));

    const groupsWithModifiers = await Promise.all(
      groups.map(async (group) => {
        const mods = await this.db
          .select()
          .from(menuModifiers)
          .where(eq(menuModifiers.groupId, group.id))
          .orderBy(asc(menuModifiers.position));
        return { ...group, modifiers: mods };
      }),
    );

    return { ...item, modifierGroups: groupsWithModifiers };
  }

  async createMenuItem(tenantId: string, input: CreateMenuItemInput) {
    const slug = this.toSlug(input.name);
    const [item] = await this.db
      .insert(menuItems)
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

  async updateMenuItem(
    tenantId: string,
    id: string,
    input: UpdateMenuItemInput,
  ) {
    const updateData: any = { ...input, updatedAt: new Date() };
    if (input.name) updateData.slug = this.toSlug(input.name);
    const [updated] = await this.db
      .update(menuItems)
      .set(updateData)
      .where(and(eq(menuItems.id, id), eq(menuItems.tenantId, tenantId)))
      .returning();
    if (!updated) throw new NotFoundException('Menü-Item nicht gefunden');
    return updated;
  }

  async deleteMenuItem(tenantId: string, id: string) {
    const [deleted] = await this.db
      .delete(menuItems)
      .where(and(eq(menuItems.id, id), eq(menuItems.tenantId, tenantId)))
      .returning();
    if (!deleted) throw new NotFoundException('Menü-Item nicht gefunden');
    return true;
  }

  // ─── Modifier Groups ──────────────────────────────────────────────────────────

  async createModifierGroup(tenantId: string, input: CreateModifierGroupInput) {
    const [group] = await this.db
      .insert(menuModifierGroups)
      .values({ tenantId, ...input, maxSelections: input.maxSelections ?? 1 })
      .returning();
    return group;
  }

  async updateModifierGroup(
    tenantId: string,
    id: string,
    input: UpdateModifierGroupInput,
  ) {
    const [updated] = await this.db
      .update(menuModifierGroups)
      .set(input)
      .where(
        and(
          eq(menuModifierGroups.id, id),
          eq(menuModifierGroups.tenantId, tenantId),
        ),
      )
      .returning();
    if (!updated) throw new NotFoundException('Modifier-Gruppe nicht gefunden');
    return updated;
  }

  async deleteModifierGroup(tenantId: string, id: string) {
    await this.db
      .delete(menuModifierGroups)
      .where(
        and(
          eq(menuModifierGroups.id, id),
          eq(menuModifierGroups.tenantId, tenantId),
        ),
      );
    return true;
  }

  // ─── Modifiers ────────────────────────────────────────────────────────────────

  async createModifier(tenantId: string, input: CreateModifierInput) {
    const [modifier] = await this.db
      .insert(menuModifiers)
      .values({ tenantId, ...input, priceModifier: input.priceModifier ?? 0 })
      .returning();
    return modifier;
  }

  async updateModifier(
    tenantId: string,
    id: string,
    input: UpdateModifierInput,
  ) {
    const [updated] = await this.db
      .update(menuModifiers)
      .set(input)
      .where(
        and(eq(menuModifiers.id, id), eq(menuModifiers.tenantId, tenantId)),
      )
      .returning();
    if (!updated) throw new NotFoundException('Modifier nicht gefunden');
    return updated;
  }

  async deleteModifier(tenantId: string, id: string) {
    await this.db
      .delete(menuModifiers)
      .where(
        and(eq(menuModifiers.id, id), eq(menuModifiers.tenantId, tenantId)),
      );
    return true;
  }

  // ─── Food Orders ──────────────────────────────────────────────────────────────

  async getFoodOrders(tenantId: string, status?: string) {
    const conditions = [eq(foodOrders.tenantId, tenantId)];
    if (status) conditions.push(eq(foodOrders.status, status));

    const result = await this.db
      .select()
      .from(foodOrders)
      .where(and(...conditions))
      .orderBy(desc(foodOrders.createdAt));

    return { orders: result, total: result.length };
  }

  async getFoodOrderById(tenantId: string, id: string) {
    const [order] = await this.db
      .select()
      .from(foodOrders)
      .where(and(eq(foodOrders.id, id), eq(foodOrders.tenantId, tenantId)));
    if (!order) throw new NotFoundException('Bestellung nicht gefunden');

    const items = await this.db
      .select()
      .from(foodOrderItems)
      .where(eq(foodOrderItems.foodOrderId, id));

    const history = await this.db
      .select()
      .from(foodOrderStatusHistory)
      .where(eq(foodOrderStatusHistory.foodOrderId, id))
      .orderBy(asc(foodOrderStatusHistory.createdAt));

    return {
      ...order,
      items: items.map((i) => ({
        ...i,
        selectedModifiers: i.selectedModifiers ?? [],
      })),
      statusHistory: history,
    };
  }

  async createFoodOrder(tenantId: string, input: CreateFoodOrderInput) {
    // Coupon prüfen
    let discountAmount = 0;
    let couponId: string | undefined;

    if (input.couponCode) {
      const [coupon] = await this.db
        .select()
        .from(coupons)
        .where(
          and(
            eq(coupons.tenantId, tenantId),
            eq(coupons.code, input.couponCode.toUpperCase()),
            eq(coupons.isActive, true),
          ),
        );

      if (!coupon) throw new BadRequestException('Ungültiger Gutschein-Code');
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        throw new BadRequestException('Gutschein bereits aufgebraucht');
      }
      if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        throw new BadRequestException('Gutschein abgelaufen');
      }
      couponId = coupon.id;
    }

    // Items berechnen
    let subtotal = 0;
    const resolvedItems: any[] = [];

    for (const item of input.items) {
      const [menuItem] = await this.db
        .select()
        .from(menuItems)
        .where(
          and(
            eq(menuItems.id, item.menuItemId),
            eq(menuItems.tenantId, tenantId),
          ),
        );
      if (!menuItem)
        throw new NotFoundException(
          `Menü-Item ${item.menuItemId} nicht gefunden`,
        );

      const modifiersTotal = (item.selectedModifiers ?? []).reduce(
        (sum, m) => sum + m.priceModifier,
        0,
      );
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

    // Rabatt berechnen
    if (couponId) {
      const [coupon] = await this.db
        .select()
        .from(coupons)
        .where(eq(coupons.id, couponId));
      if (coupon.type === 'percent') {
        discountAmount = Math.floor((subtotal * coupon.value) / 100);
      } else if (coupon.type === 'fixed') {
        discountAmount = Math.min(coupon.value, subtotal);
      }
      // Coupon-Nutzung erhöhen
      await this.db
        .update(coupons)
        .set({ usedCount: coupon.usedCount + 1 })
        .where(eq(coupons.id, couponId));
    }

    // Settings laden für Liefergebühr
    const settings = await this.getSettings(tenantId);
    const deliveryFee =
      input.orderType === 'delivery' ? (settings.deliveryFee ?? 0) : 0;
    const tax = 0; // MwSt kann man später konfigurierbar machen
    const total = subtotal + deliveryFee + tax - discountAmount;

    const orderNumber = `FO-${Date.now().toString().slice(-8)}`;
    const pickupCode =
      input.orderType !== 'delivery' ? this.generatePickupCode() : undefined;

    const estimatedMinutes =
      input.orderType === 'delivery'
        ? (settings.estimatedDeliveryTime ?? 45)
        : (settings.estimatedPickupTime ?? 20);
    const estimatedReadyAt = new Date(
      Date.now() + estimatedMinutes * 60 * 1000,
    );

    const [order] = await this.db
      .insert(foodOrders)
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

    // Items einfügen
    if (resolvedItems.length > 0) {
      await this.db
        .insert(foodOrderItems)
        .values(resolvedItems.map((i) => ({ foodOrderId: order.id, ...i })));
    }

    // Coupon-Use loggen
    if (couponId && input.customerEmail) {
      await this.db.insert(couponUses).values({
        couponId,
        tenantId,
        customerEmail: input.customerEmail,
        referenceId: order.id,
        referenceType: 'restaurant',
        discountAmount,
      });
    }

    // Status-History: erster Eintrag
    await this.db.insert(foodOrderStatusHistory).values({
      foodOrderId: order.id,
      tenantId,
      status: 'new',
      note: 'Bestellung eingegangen',
    });

    return this.getFoodOrderById(tenantId, order.id);
  }

  async updateFoodOrderStatus(
    tenantId: string,
    id: string,
    input: UpdateFoodOrderStatusInput,
  ) {
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
      throw new BadRequestException(`Ungültiger Status: ${input.status}`);
    }

    const [updated] = await this.db
      .update(foodOrders)
      .set({ status: input.status, updatedAt: new Date() })
      .where(and(eq(foodOrders.id, id), eq(foodOrders.tenantId, tenantId)))
      .returning();
    if (!updated) throw new NotFoundException('Bestellung nicht gefunden');

    await this.db.insert(foodOrderStatusHistory).values({
      foodOrderId: id,
      tenantId,
      status: input.status,
      note: input.note,
    });

    return this.getFoodOrderById(tenantId, id);
  }

  async confirmPickup(tenantId: string, orderId: string, pickupCode: string) {
    const [order] = await this.db
      .select()
      .from(foodOrders)
      .where(
        and(eq(foodOrders.id, orderId), eq(foodOrders.tenantId, tenantId)),
      );

    if (!order) throw new NotFoundException('Bestellung nicht gefunden');
    if (order.pickupCode !== pickupCode)
      throw new BadRequestException('Falscher Abholcode');
    if (order.pickupCodeUsed)
      throw new BadRequestException('Abholcode bereits verwendet');

    await this.db
      .update(foodOrders)
      .set({ pickupCodeUsed: true, status: 'delivered', updatedAt: new Date() })
      .where(eq(foodOrders.id, orderId));

    await this.db.insert(foodOrderStatusHistory).values({
      foodOrderId: orderId,
      tenantId,
      status: 'delivered',
      note: `Abholung bestätigt (Code: ${pickupCode})`,
    });

    return true;
  }

  // ─── Public: Menü laden ───────────────────────────────────────────────────────

  async getPublicMenu(tenantId: string) {
    const cats = await this.db
      .select()
      .from(menuCategories)
      .where(
        and(
          eq(menuCategories.tenantId, tenantId),
          eq(menuCategories.isActive, true),
        ),
      )
      .orderBy(asc(menuCategories.position));

    const result = await Promise.all(
      cats.map(async (cat) => {
        const items = await this.db
          .select()
          .from(menuItems)
          .where(
            and(
              eq(menuItems.categoryId, cat.id),
              eq(menuItems.isAvailable, true),
            ),
          )
          .orderBy(asc(menuItems.position));

        const itemsWithModifiers = await Promise.all(
          items.map((item) => this.getMenuItemWithModifiers(tenantId, item.id)),
        );

        return { ...cat, items: itemsWithModifiers };
      }),
    );

    return result;
  }
}
