import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/auth/guards/gql-auth.guard';
import { PackageGuard } from '../../core/package/guards/package.guard'; // ← NEU
import { RequireFeature } from '../../core/package/decorators/require-feature.decorator'; // ← NEU
import { TenantId } from '../../core/auth/decorators/tenant-id.decorator';
import { PACKAGES, PackageType } from '../../core/package/package.helper';

import {
  Product,
  ProductsResponse,
  Category,
  CategoriesResponse,
} from './dto/product.types';
import { Order, OrdersResponse, OrderStatus } from './dto/order.types';
import {
  CreateProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from './dto/product.input';
import { CreateOrderInput } from './dto/order.input';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import {
  products,
  categories,
  orders,
  orderItems,
  tenants,
} from '../../drizzle/schema'; // ← tenants hinzufügen
import { eq, and, desc } from 'drizzle-orm';

@Resolver()
export class ShopResolver {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // ===== CATEGORIES =====

  @Query(() => CategoriesResponse)
  @UseGuards(GqlAuthGuard)
  async categories(@TenantId() tenantId: string): Promise<CategoriesResponse> {
    const result = await this.db
      .select()
      .from(categories)
      .where(eq(categories.tenantId, tenantId))
      .orderBy(desc(categories.createdAt));

    return {
      categories: result.map((cat) => ({
        ...cat,
        description: cat.description ?? undefined,
        image: cat.image ?? undefined,
        isActive: cat.isActive ?? true,
        createdAt: cat.createdAt ?? new Date(),
      })),
      total: result.length,
    };
  }

  @Query(() => [Category])
  async publicCategories(): Promise<Category[]> {
    const result = await this.db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.name);

    return result.map((cat) => ({
      ...cat,
      description: cat.description ?? undefined,
      image: cat.image ?? undefined,
      isActive: cat.isActive ?? true,
      createdAt: cat.createdAt ?? new Date(),
    }));
  }

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard)
  async createCategory(
    @Args('input') input: CreateCategoryInput,
    @TenantId() tenantId: string,
  ): Promise<Category> {
    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    const [category] = await this.db
      .insert(categories)
      .values({
        tenantId,
        name: input.name,
        slug,
        description: input.description,
        image: input.image,
        isActive: input.isActive,
      })
      .returning();

    return {
      ...category,
      description: category.description ?? undefined,
      image: category.image ?? undefined,
      isActive: category.isActive ?? true,
      createdAt: category.createdAt ?? new Date(),
    };
  }

  @Mutation(() => Category)
  @UseGuards(GqlAuthGuard)
  async updateCategory(
    @Args('id') id: string,
    @Args('input') input: UpdateCategoryInput,
    @TenantId() tenantId: string,
  ): Promise<Category> {
    const [category] = await this.db
      .update(categories)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)))
      .returning();

    return {
      ...category,
      description: category.description ?? undefined,
      image: category.image ?? undefined,
      isActive: category.isActive ?? true,
      createdAt: category.createdAt ?? new Date(),
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteCategory(
    @Args('id') id: string,
    @TenantId() tenantId: string,
  ): Promise<boolean> {
    await this.db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)));
    return true;
  }

  // ===== PRODUCTS =====

  @Query(() => ProductsResponse)
  @UseGuards(GqlAuthGuard)
  async products(@TenantId() tenantId: string): Promise<ProductsResponse> {
    const result = await this.db
      .select()
      .from(products)
      .where(eq(products.tenantId, tenantId))
      .orderBy(desc(products.createdAt));

    return {
      products: result.map((product) => ({
        ...product,
        description: product.description ?? undefined,
        compareAtPrice: product.compareAtPrice ?? undefined,
        images: product.images ? JSON.parse(product.images) : undefined,
        categoryId: product.categoryId ?? undefined,
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
        stock: product.stock ?? 0,
        createdAt: product.createdAt ?? new Date(),
      })),
      total: result.length,
    };
  }

  @Query(() => [Product])
  async publicProducts(): Promise<Product[]> {
    const result = await this.db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.isFeatured), desc(products.createdAt));

    return result.map((product) => ({
      ...product,
      description: product.description ?? undefined,
      compareAtPrice: product.compareAtPrice ?? undefined,
      images: product.images ? JSON.parse(product.images) : undefined,
      categoryId: product.categoryId ?? undefined,
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
      stock: product.stock ?? 0,
      createdAt: product.createdAt ?? new Date(),
    }));
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard, PackageGuard) // ← PackageGuard hinzufügen
  @RequireFeature('shop') // ← Feature-Check
  async createProduct(
    @Args('input') input: CreateProductInput,
    @TenantId() tenantId: string,
  ): Promise<Product> {
    // Check Limit
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      throw new Error('Tenant nicht gefunden');
    }

    const currentProducts = await this.db
      .select()
      .from(products)
      .where(eq(products.tenantId, tenantId));

    const pkg = PACKAGES[tenant.package as PackageType];
    const maxProducts = pkg?.features.maxProducts ?? 0;
    if (maxProducts !== -1 && currentProducts.length >= maxProducts) {
      const limits = {
        starter: 0,
        business: 100,
        enterprise: -1,
      };
      throw new Error(
        `Produkt-Limit erreicht! Dein ${tenant.package.toUpperCase()} Package erlaubt ${limits[tenant.package as keyof typeof limits] === -1 ? 'unbegrenzt' : limits[tenant.package as keyof typeof limits]} Produkte. Upgrade auf BUSINESS für mehr!`,
      );
    }

    const slug =
      input.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-') +
      '-' +
      Date.now();

    const [product] = await this.db
      .insert(products)
      .values({
        tenantId,
        name: input.name,
        slug,
        description: input.description,
        price: input.price,
        compareAtPrice: input.compareAtPrice,
        stock: input.stock,
        images: input.images ? JSON.stringify(input.images) : null,
        categoryId: input.categoryId,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
      })
      .returning();

    return {
      ...product,
      description: product.description ?? undefined,
      compareAtPrice: product.compareAtPrice ?? undefined,
      images: product.images ? JSON.parse(product.images) : undefined,
      categoryId: product.categoryId ?? undefined,
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
      stock: product.stock ?? 0,
      createdAt: product.createdAt ?? new Date(),
    };
  }

  @Mutation(() => Product)
  @UseGuards(GqlAuthGuard)
  async updateProduct(
    @Args('id') id: string,
    @Args('input') input: UpdateProductInput,
    @TenantId() tenantId: string,
  ): Promise<Product> {
    const updateData: any = { ...input, updatedAt: new Date() };
    if (input.images) {
      updateData.images = JSON.stringify(input.images);
    }

    const [product] = await this.db
      .update(products)
      .set(updateData)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .returning();

    return {
      ...product,
      description: product.description ?? undefined,
      compareAtPrice: product.compareAtPrice ?? undefined,
      images: product.images ? JSON.parse(product.images) : undefined,
      categoryId: product.categoryId ?? undefined,
      isActive: product.isActive ?? true,
      isFeatured: product.isFeatured ?? false,
      stock: product.stock ?? 0,
      createdAt: product.createdAt ?? new Date(),
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteProduct(
    @Args('id') id: string,
    @TenantId() tenantId: string,
  ): Promise<boolean> {
    await this.db
      .delete(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)));
    return true;
  }
  // ===== ORDERS =====

  @Query(() => OrdersResponse)
  @UseGuards(GqlAuthGuard)
  async orders(@TenantId() tenantId: string): Promise<OrdersResponse> {
    const result = await this.db
      .select()
      .from(orders)
      .where(eq(orders.tenantId, tenantId))
      .orderBy(desc(orders.createdAt));

    return {
      orders: result.map((order) => ({
        ...order,
        customerAddress: order.customerAddress ?? undefined,
        notes: order.notes ?? undefined,
        status: order.status as OrderStatus,
        tax: order.tax ?? 0,
        shipping: order.shipping ?? 0,
        createdAt: order.createdAt ?? new Date(),
      })),
      total: result.length,
    };
  }

  @Query(() => Order)
  @UseGuards(GqlAuthGuard)
  async order(
    @Args('id') id: string,
    @TenantId() tenantId: string,
  ): Promise<Order> {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.tenantId, tenantId)))
      .limit(1);

    if (!order) {
      throw new Error('Bestellung nicht gefunden');
    }

    // Get order items
    const items = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    return {
      ...order,
      customerAddress: order.customerAddress ?? undefined,
      notes: order.notes ?? undefined,
      status: order.status as OrderStatus,
      tax: order.tax ?? 0,
      shipping: order.shipping ?? 0,
      items: items.map((item) => ({
        ...item,
        total: item.total ?? 0,
      })),
      createdAt: order.createdAt ?? new Date(),
    };
  }

  @Mutation(() => Order)
  async createOrder(
    @Args('input') input: CreateOrderInput,
    @TenantId() tenantId: string,
  ): Promise<Order> {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order
    const [order] = await this.db
      .insert(orders)
      .values({
        tenantId,
        orderNumber,
        customerEmail: input.customerEmail,
        customerName: input.customerName,
        customerAddress: input.customerAddress,
        status: 'pending',
        subtotal: input.subtotal,
        tax: input.tax,
        shipping: input.shipping,
        total: input.total,
        notes: input.notes,
      })
      .returning();

    // Create order items
    const itemsToInsert = input.items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      productName: item.productName,
      productPrice: item.productPrice,
      quantity: item.quantity,
      total: item.productPrice * item.quantity,
    }));

    await this.db.insert(orderItems).values(itemsToInsert);

    // Update product stock
    for (const item of input.items) {
      const [product] = await this.db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);

      if (product) {
        await this.db
          .update(products)
          .set({
            stock: Math.max(0, (product.stock ?? 0) - item.quantity),
            updatedAt: new Date(),
          })
          .where(eq(products.id, item.productId));
      }
    }

    return {
      ...order,
      customerAddress: order.customerAddress ?? undefined,
      notes: order.notes ?? undefined,
      status: order.status as OrderStatus,
      tax: order.tax ?? 0,
      shipping: order.shipping ?? 0,
      createdAt: order.createdAt ?? new Date(),
    };
  }

  @Mutation(() => Order)
  @UseGuards(GqlAuthGuard)
  async updateOrderStatus(
    @Args('id') id: string,
    @Args('status') status: OrderStatus,
    @TenantId() tenantId: string,
  ): Promise<Order> {
    const [order] = await this.db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(orders.id, id), eq(orders.tenantId, tenantId)))
      .returning();

    if (!order) {
      throw new Error('Bestellung nicht gefunden');
    }

    return {
      ...order,
      customerAddress: order.customerAddress ?? undefined,
      notes: order.notes ?? undefined,
      status: order.status as OrderStatus,
      tax: order.tax ?? 0,
      shipping: order.shipping ?? 0,
      createdAt: order.createdAt ?? new Date(),
    };
  }
}
