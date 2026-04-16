import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { eq, and, desc, asc, gte, lte, sql } from 'drizzle-orm';
import {
  localStoreSettings,
  localProducts,
  localDeals,
  localPickupSlots,
  localOrders,
  localOrderItems,
  coupons,
  couponUses,
} from '../../drizzle/schema';
import {
  UpdateLocalStoreSettingsInput,
  CreateLocalProductInput,
  UpdateLocalProductInput,
  CreateLocalDealInput,
  UpdateLocalDealInput,
  CreatePickupSlotInput,
  UpdatePickupSlotInput,
  CreateLocalOrderInput,
  UpdateLocalOrderStatusInput,
} from './dto/local-store.input';

@Injectable()
export class LocalStoreService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // ─── Helpers ──────────────────────────────────────────────────────────────────
private toSlug(name: string): string {
  if (!name) return `product-${Date.now()}`;
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

  private getDayName(day: number): string {
    return ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][day];
  }

  // ─── Settings ─────────────────────────────────────────────────────────────────

  async getSettings(tenantId: string) {
    const [settings] = await this.db
      .select()
      .from(localStoreSettings)
      .where(eq(localStoreSettings.tenantId, tenantId));

    if (!settings) {
      const [created] = await this.db
        .insert(localStoreSettings)
        .values({ tenantId })
        .returning();
      return created;
    }
    return settings;
  }

  async updateSettings(tenantId: string, input: UpdateLocalStoreSettingsInput) {
    const existing = await this.getSettings(tenantId);
    const [updated] = await this.db
      .update(localStoreSettings)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(localStoreSettings.id, existing.id))
      .returning();
    return updated;
  }

  // ─── Products ─────────────────────────────────────────────────────────────────

  async getProducts(tenantId: string, onlyAvailable = false) {
    const conditions = [eq(localProducts.tenantId, tenantId)];
    if (onlyAvailable) conditions.push(eq(localProducts.isAvailable, true));

    const result = await this.db
      .select()
      .from(localProducts)
      .where(and(...conditions))
      .orderBy(desc(localProducts.isFeatured), asc(localProducts.name));

    return { products: result, total: result.length };
  }

  async getProductById(tenantId: string, id: string) {
    const [product] = await this.db
      .select()
      .from(localProducts)
      .where(and(eq(localProducts.id, id), eq(localProducts.tenantId, tenantId)));
    if (!product) throw new NotFoundException('Produkt nicht gefunden');
    return product;
  }

  async createProduct(tenantId: string, input: CreateLocalProductInput) {
    let slug = this.toSlug(input.name);

    // Slug-Konflikt verhindern
    const existing = await this.db
      .select()
      .from(localProducts)
      .where(and(eq(localProducts.tenantId, tenantId), eq(localProducts.slug, slug)));
    if (existing.length > 0) slug = `${slug}-${Date.now()}`;

    const [product] = await this.db
      .insert(localProducts)
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

  async updateProduct(tenantId: string, id: string, input: UpdateLocalProductInput) {
    const updateData: any = { ...input, updatedAt: new Date() };
    if (input.name) updateData.slug = this.toSlug(input.name);

    const [updated] = await this.db
      .update(localProducts)
      .set(updateData)
      .where(and(eq(localProducts.id, id), eq(localProducts.tenantId, tenantId)))
      .returning();
    if (!updated) throw new NotFoundException('Produkt nicht gefunden');
    return updated;
  }

  async deleteProduct(tenantId: string, id: string) {
    const [deleted] = await this.db
      .delete(localProducts)
      .where(and(eq(localProducts.id, id), eq(localProducts.tenantId, tenantId)))
      .returning();
    if (!deleted) throw new NotFoundException('Produkt nicht gefunden');
    return true;
  }

  // ─── Deals ────────────────────────────────────────────────────────────────────

  async getDeals(tenantId: string, onlyActive = false) {
    const conditions = [eq(localDeals.tenantId, tenantId)];
    if (onlyActive) {
      const now = new Date();
      conditions.push(eq(localDeals.isActive, true));
      conditions.push(lte(localDeals.startsAt, now));
      conditions.push(gte(localDeals.endsAt, now));
    }

    const result = await this.db
      .select()
      .from(localDeals)
      .where(and(...conditions))
      .orderBy(desc(localDeals.createdAt));

    // Produkte auflösen
    const dealsWithProducts = await Promise.all(
      result.map(async (deal) => {
        if (!deal.localProductId) return { ...deal, product: null };
        const [product] = await this.db
          .select()
          .from(localProducts)
          .where(eq(localProducts.id, deal.localProductId));
        return { ...deal, product: product ?? null };
      })
    );

    return { deals: dealsWithProducts, total: dealsWithProducts.length };
  }

  async createDeal(tenantId: string, input: CreateLocalDealInput) {
    if (new Date(input.endsAt) <= new Date(input.startsAt)) {
      throw new BadRequestException('Enddatum muss nach dem Startdatum liegen');
    }
    const [deal] = await this.db
      .insert(localDeals)
      .values({ tenantId, ...input })
      .returning();
    return deal;
  }

  async updateDeal(tenantId: string, id: string, input: UpdateLocalDealInput) {
    const [updated] = await this.db
      .update(localDeals)
      .set(input)
      .where(and(eq(localDeals.id, id), eq(localDeals.tenantId, tenantId)))
      .returning();
    if (!updated) throw new NotFoundException('Deal nicht gefunden');
    return updated;
  }

  async deleteDeal(tenantId: string, id: string) {
    const [deleted] = await this.db
      .delete(localDeals)
      .where(and(eq(localDeals.id, id), eq(localDeals.tenantId, tenantId)))
      .returning();
    if (!deleted) throw new NotFoundException('Deal nicht gefunden');
    return true;
  }

  // ─── Pickup Slots ─────────────────────────────────────────────────────────────

  async getPickupSlots(tenantId: string) {
    const result = await this.db
      .select()
      .from(localPickupSlots)
      .where(eq(localPickupSlots.tenantId, tenantId))
      .orderBy(asc(localPickupSlots.dayOfWeek), asc(localPickupSlots.startTime));
    return { slots: result, total: result.length };
  }

  async createPickupSlot(tenantId: string, input: CreatePickupSlotInput) {
    const [slot] = await this.db
      .insert(localPickupSlots)
      .values({ tenantId, ...input, maxOrders: input.maxOrders ?? 5 })
      .returning();
    return slot;
  }

  async updatePickupSlot(tenantId: string, id: string, input: UpdatePickupSlotInput) {
    const [updated] = await this.db
      .update(localPickupSlots)
      .set(input)
      .where(and(eq(localPickupSlots.id, id), eq(localPickupSlots.tenantId, tenantId)))
      .returning();
    if (!updated) throw new NotFoundException('Slot nicht gefunden');
    return updated;
  }

  async deletePickupSlot(tenantId: string, id: string) {
    await this.db
      .delete(localPickupSlots)
      .where(and(eq(localPickupSlots.id, id), eq(localPickupSlots.tenantId, tenantId)));
    return true;
  }

  // Verfügbare Slots für die nächsten N Tage berechnen (für Kunden)
  async getAvailablePickupSlots(tenantId: string, days = 7) {
    const slots = await this.db
      .select()
      .from(localPickupSlots)
      .where(and(eq(localPickupSlots.tenantId, tenantId), eq(localPickupSlots.isActive, true)));

    const available: any[] = [];
    const today = new Date();

    for (let d = 0; d < days; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      const dow = date.getDay(); // 0=Sonntag
      const dateStr = date.toISOString().split('T')[0];

      const daySlots = slots.filter(s => s.dayOfWeek === dow);

      for (const slot of daySlots) {
        // Zähle wie viele Bestellungen schon auf diesem Slot+Datum liegen
        const [{ count }] = await this.db
          .select({ count: sql<number>`count(*)` })
          .from(localOrders)
          .where(and(
            eq(localOrders.tenantId, tenantId),
            eq(localOrders.pickupSlotId, slot.id),
            eq(localOrders.pickupDate, dateStr),
            sql`status NOT IN ('cancelled')`,
          ));

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

  // ─── Orders ───────────────────────────────────────────────────────────────────

  async getOrders(tenantId: string, status?: string) {
    const conditions = [eq(localOrders.tenantId, tenantId)];
    if (status) conditions.push(eq(localOrders.status, status));

    const result = await this.db
      .select()
      .from(localOrders)
      .where(and(...conditions))
      .orderBy(desc(localOrders.createdAt));

    return { orders: result, total: result.length };
  }

  async getOrderById(tenantId: string, id: string) {
    const [order] = await this.db
      .select()
      .from(localOrders)
      .where(and(eq(localOrders.id, id), eq(localOrders.tenantId, tenantId)));
    if (!order) throw new NotFoundException('Bestellung nicht gefunden');

    const items = await this.db
      .select()
      .from(localOrderItems)
      .where(eq(localOrderItems.localOrderId, id));

    return { ...order, items };
  }

  async createOrder(tenantId: string, input: CreateLocalOrderInput) {
    const settings = await this.getSettings(tenantId);

    // Slot-Kapazität prüfen bei Pickup
    if (input.orderType === 'pickup' && input.pickupSlotId && input.pickupDate) {
      const [{ count }] = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(localOrders)
        .where(and(
          eq(localOrders.tenantId, tenantId),
          eq(localOrders.pickupSlotId, input.pickupSlotId),
          eq(localOrders.pickupDate, input.pickupDate),
          sql`status NOT IN ('cancelled')`,
        ));

      const [slot] = await this.db
        .select()
        .from(localPickupSlots)
        .where(eq(localPickupSlots.id, input.pickupSlotId));

      if (slot && Number(count) >= slot.maxOrders) {
        throw new BadRequestException('Dieser Abholtermin ist bereits ausgebucht');
      }
    }

    // Coupon prüfen
    let discountAmount = 0;
    let couponId: string | undefined;

    if (input.couponCode) {
      const [coupon] = await this.db
        .select()
        .from(coupons)
        .where(and(
          eq(coupons.tenantId, tenantId),
          eq(coupons.code, input.couponCode.toUpperCase()),
          eq(coupons.isActive, true),
        ));

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
      const [product] = await this.db
        .select()
        .from(localProducts)
        .where(and(eq(localProducts.id, item.localProductId), eq(localProducts.tenantId, tenantId)));

      if (!product) throw new NotFoundException(`Produkt ${item.localProductId} nicht gefunden`);
      if (!product.isAvailable) throw new BadRequestException(`${product.name} ist nicht verfügbar`);
      if (!product.isUnlimited && product.stock !== null && product.stock < item.quantity) {
        throw new BadRequestException(`Nicht genug Lagerbestand für ${product.name}`);
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

      // Lagerbestand reduzieren wenn nicht unlimited
      if (!product.isUnlimited && product.stock !== null) {
        await this.db
          .update(localProducts)
          .set({ stock: product.stock - item.quantity })
          .where(eq(localProducts.id, product.id));
      }
    }

    // Mindestbestellwert prüfen
    if (settings.minOrderAmount && subtotal < settings.minOrderAmount) {
      throw new BadRequestException(
        `Mindestbestellwert: ${(settings.minOrderAmount / 100).toFixed(2)} €`
      );
    }

    // Rabatt berechnen
    if (couponId) {
      const [coupon] = await this.db.select().from(coupons).where(eq(coupons.id, couponId));
      if (coupon.type === 'percent') {
        discountAmount = Math.floor(subtotal * coupon.value / 100);
      } else if (coupon.type === 'fixed') {
        discountAmount = Math.min(coupon.value, subtotal);
      }
      await this.db
        .update(coupons)
        .set({ usedCount: coupon.usedCount + 1 })
        .where(eq(coupons.id, couponId));
    }

    const total = subtotal - discountAmount;
    const orderNumber = `LO-${Date.now().toString().slice(-8)}`;
    const pickupCode = this.generatePickupCode();

    const [order] = await this.db
      .insert(localOrders)
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

    // Items einfügen
    if (resolvedItems.length > 0) {
      await this.db.insert(localOrderItems).values(
        resolvedItems.map(i => ({ localOrderId: order.id, ...i }))
      );
    }

    // Coupon-Use loggen
    if (couponId && input.customerEmail) {
      await this.db.insert(couponUses).values({
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

  async updateOrderStatus(tenantId: string, id: string, input: UpdateLocalOrderStatusInput) {
    const valid = ['pending', 'confirmed', 'ready', 'picked_up', 'cancelled'];
    if (!valid.includes(input.status)) {
      throw new BadRequestException(`Ungültiger Status: ${input.status}`);
    }

    const [updated] = await this.db
      .update(localOrders)
      .set({ status: input.status, updatedAt: new Date() })
      .where(and(eq(localOrders.id, id), eq(localOrders.tenantId, tenantId)))
      .returning();
    if (!updated) throw new NotFoundException('Bestellung nicht gefunden');

    return this.getOrderById(tenantId, id);
  }

  async confirmPickup(tenantId: string, orderId: string, pickupCode: string) {
    const [order] = await this.db
      .select()
      .from(localOrders)
      .where(and(eq(localOrders.id, orderId), eq(localOrders.tenantId, tenantId)));

    if (!order) throw new NotFoundException('Bestellung nicht gefunden');
    if (order.pickupCode !== pickupCode) throw new BadRequestException('Falscher Abholcode');
    if (order.pickupCodeUsed) throw new BadRequestException('Abholcode bereits verwendet');

    await this.db
      .update(localOrders)
      .set({
        pickupCodeUsed: true,
        pickupConfirmedAt: new Date(),
        status: 'picked_up',
        updatedAt: new Date(),
      })
      .where(eq(localOrders.id, orderId));

    return true;
  }

  // ─── Public API ───────────────────────────────────────────────────────────────

  async getPublicStore(tenantId: string) {
    const [settings] = await this.db
      .select()
      .from(localStoreSettings)
      .where(eq(localStoreSettings.tenantId, tenantId));

    const products = await this.db
      .select()
      .from(localProducts)
      .where(and(eq(localProducts.tenantId, tenantId), eq(localProducts.isAvailable, true)))
      .orderBy(desc(localProducts.isFeatured), asc(localProducts.name));

    const now = new Date();
    const activeDeals = await this.db
      .select()
      .from(localDeals)
      .where(and(
        eq(localDeals.tenantId, tenantId),
        eq(localDeals.isActive, true),
        lte(localDeals.startsAt, now),
        gte(localDeals.endsAt, now),
      ));

    const availableSlots = await this.getAvailablePickupSlots(tenantId, 14);

    return { settings, products, deals: activeDeals, availableSlots };
  }
}
