import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { navigations, navigationItems } from '../../drizzle/schema';
import { eq, and, isNull, desc, asc } from 'drizzle-orm';
import { CreateNavigationInput } from './dto/create-navigation.input';
import { UpdateNavigationInput } from './dto/update-navigation.input';
import { CreateNavigationItemInput } from './dto/create-navigation-item.input';
import { UpdateNavigationItemInput } from './dto/update-navigation-item.input';

@Injectable()
export class NavigationService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // ==================== NAVIGATIONS ====================

  async createNavigation(tenantId: string, input: CreateNavigationInput) {
    const [navigation] = await this.db
      .insert(navigations)
      .values({
        tenantId,
        name: input.name,
        location: input.location,
        description: input.description,
        isActive: input.isActive ?? true,
      })
      .returning();

    return navigation;
  }

  async findAll(tenantId: string) {
    const result = await this.db.query.navigations.findMany({
      where: eq(navigations.tenantId, tenantId),
      with: {
        items: {
          orderBy: asc(navigationItems.order),
          with: {
            children: {
              orderBy: asc(navigationItems.order),
            },
          },
        },
      },
      orderBy: desc(navigations.createdAt),
    });

    return result;
  }

  async findByLocation(tenantId: string, location: string) {
    const result = await this.db.query.navigations.findFirst({
      where: and(
        eq(navigations.tenantId, tenantId),
        eq(navigations.location, location),
        eq(navigations.isActive, true),
      ),
      with: {
        items: {
          where: isNull(navigationItems.parentId),
          orderBy: asc(navigationItems.order),
          with: {
            children: {
              orderBy: asc(navigationItems.order),
            },
          },
        },
      },
    });

    return result || null;
  }

  async findOne(id: string, tenantId: string) {
    const result = await this.db.query.navigations.findFirst({
      where: and(eq(navigations.id, id), eq(navigations.tenantId, tenantId)),
      with: {
        items: {
          orderBy: asc(navigationItems.order),
          with: {
            children: {
              orderBy: asc(navigationItems.order),
            },
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException(`Navigation with ID ${id} not found`);
    }

    return result;
  }

  async updateNavigation(
    id: string,
    tenantId: string,
    input: UpdateNavigationInput,
  ) {
    // Verify ownership
    await this.findOne(id, tenantId);

    const [updated] = await this.db
      .update(navigations)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(and(eq(navigations.id, id), eq(navigations.tenantId, tenantId)))
      .returning();

    return updated;
  }

  async deleteNavigation(id: string, tenantId: string) {
    await this.findOne(id, tenantId);

    await this.db
      .delete(navigations)
      .where(and(eq(navigations.id, id), eq(navigations.tenantId, tenantId)));

    return true;
  }

  // ==================== NAVIGATION ITEMS ====================

  async createNavigationItem(
    navigationId: string,
    tenantId: string,
    input: CreateNavigationItemInput,
  ) {
    // Verify navigation belongs to tenant
    await this.findOne(navigationId, tenantId);

    const [item] = await this.db
      .insert(navigationItems)
      .values({
        navigationId,
        label: input.label,
        type: input.type,
        url: input.url,
        pageId: input.pageId,
        postId: input.postId,
        categoryId: input.categoryId,
        icon: input.icon,
        cssClass: input.cssClass,
        openInNewTab: input.openInNewTab ?? false,
        order: input.order ?? 0,
        parentId: input.parentId,
      })
      .returning();

    return item;
  }

  async findNavigationItems(navigationId: string, tenantId: string) {
    // Verify navigation belongs to tenant
    await this.findOne(navigationId, tenantId);

    const items = await this.db.query.navigationItems.findMany({
      where: and(
        eq(navigationItems.navigationId, navigationId),
        isNull(navigationItems.parentId),
      ),
      with: {
        children: {
          orderBy: asc(navigationItems.order),
        },
      },
      orderBy: asc(navigationItems.order),
    });

    return items;
  }

  async updateNavigationItem(
    itemId: string,
    tenantId: string,
    input: UpdateNavigationItemInput,
  ) {
    // Verify item exists and belongs to tenant's navigation
    const item = await this.db.query.navigationItems.findFirst({
      where: eq(navigationItems.id, itemId),
      with: {
        navigation: true,
      },
    });

    // ✅ FIX: Type Assertion
    if (!item || (item.navigation as any).tenantId !== tenantId) {
      throw new NotFoundException(
        `Navigation item with ID ${itemId} not found`,
      );
    }

    const [updated] = await this.db
      .update(navigationItems)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(navigationItems.id, itemId))
      .returning();

    return updated;
  }

  async deleteNavigationItem(itemId: string, tenantId: string) {
    // Verify item exists and belongs to tenant's navigation
    const item = await this.db.query.navigationItems.findFirst({
      where: eq(navigationItems.id, itemId),
      with: {
        navigation: true,
      },
    });

    // ✅ FIX: Type Assertion
    if (!item || (item.navigation as any).tenantId !== tenantId) {
      throw new NotFoundException(
        `Navigation item with ID ${itemId} not found`,
      );
    }

    await this.db.delete(navigationItems).where(eq(navigationItems.id, itemId));

    return true;
  }

  async reorderNavigationItems(
    navigationId: string,
    tenantId: string,
    itemOrders: { id: string; order: number }[],
  ) {
    // Verify navigation belongs to tenant
    await this.findOne(navigationId, tenantId);

    // Update all orders
    for (const { id, order } of itemOrders) {
      await this.db
        .update(navigationItems)
        .set({ order })
        .where(
          and(
            eq(navigationItems.id, id),
            eq(navigationItems.navigationId, navigationId),
          ),
        );
    }

    return true;
  }
}
