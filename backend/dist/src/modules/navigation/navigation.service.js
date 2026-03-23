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
exports.NavigationService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
let NavigationService = class NavigationService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createNavigation(tenantId, input) {
        const [navigation] = await this.db
            .insert(schema_1.navigations)
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
    async findAll(tenantId) {
        const result = await this.db.query.navigations.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.navigations.tenantId, tenantId),
            with: {
                items: {
                    orderBy: (0, drizzle_orm_1.asc)(schema_1.navigationItems.order),
                    with: {
                        children: {
                            orderBy: (0, drizzle_orm_1.asc)(schema_1.navigationItems.order),
                        },
                    },
                },
            },
            orderBy: (0, drizzle_orm_1.desc)(schema_1.navigations.createdAt),
        });
        return result;
    }
    async findByLocation(tenantId, location) {
        const result = await this.db.query.navigations.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.navigations.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.navigations.location, location), (0, drizzle_orm_1.eq)(schema_1.navigations.isActive, true)),
            with: {
                items: {
                    where: (0, drizzle_orm_1.isNull)(schema_1.navigationItems.parentId),
                    orderBy: (0, drizzle_orm_1.asc)(schema_1.navigationItems.order),
                    with: {
                        children: {
                            orderBy: (0, drizzle_orm_1.asc)(schema_1.navigationItems.order),
                        },
                    },
                },
            },
        });
        return result || null;
    }
    async findOne(id, tenantId) {
        const result = await this.db.query.navigations.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.navigations.id, id), (0, drizzle_orm_1.eq)(schema_1.navigations.tenantId, tenantId)),
            with: {
                items: {
                    orderBy: (0, drizzle_orm_1.asc)(schema_1.navigationItems.order),
                    with: {
                        children: {
                            orderBy: (0, drizzle_orm_1.asc)(schema_1.navigationItems.order),
                        },
                    },
                },
            },
        });
        if (!result) {
            throw new common_1.NotFoundException(`Navigation with ID ${id} not found`);
        }
        return result;
    }
    async updateNavigation(id, tenantId, input) {
        await this.findOne(id, tenantId);
        const [updated] = await this.db
            .update(schema_1.navigations)
            .set({
            ...input,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.navigations.id, id), (0, drizzle_orm_1.eq)(schema_1.navigations.tenantId, tenantId)))
            .returning();
        return updated;
    }
    async deleteNavigation(id, tenantId) {
        await this.findOne(id, tenantId);
        await this.db
            .delete(schema_1.navigations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.navigations.id, id), (0, drizzle_orm_1.eq)(schema_1.navigations.tenantId, tenantId)));
        return true;
    }
    async createNavigationItem(navigationId, tenantId, input) {
        await this.findOne(navigationId, tenantId);
        const [item] = await this.db
            .insert(schema_1.navigationItems)
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
    async findNavigationItems(navigationId, tenantId) {
        await this.findOne(navigationId, tenantId);
        const items = await this.db.query.navigationItems.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.navigationItems.navigationId, navigationId), (0, drizzle_orm_1.isNull)(schema_1.navigationItems.parentId)),
            with: {
                children: {
                    orderBy: (0, drizzle_orm_1.asc)(schema_1.navigationItems.order),
                },
            },
            orderBy: (0, drizzle_orm_1.asc)(schema_1.navigationItems.order),
        });
        return items;
    }
    async updateNavigationItem(itemId, tenantId, input) {
        const item = await this.db.query.navigationItems.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.navigationItems.id, itemId),
            with: {
                navigation: true,
            },
        });
        if (!item || item.navigation.tenantId !== tenantId) {
            throw new common_1.NotFoundException(`Navigation item with ID ${itemId} not found`);
        }
        const [updated] = await this.db
            .update(schema_1.navigationItems)
            .set({
            ...input,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.navigationItems.id, itemId))
            .returning();
        return updated;
    }
    async deleteNavigationItem(itemId, tenantId) {
        const item = await this.db.query.navigationItems.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.navigationItems.id, itemId),
            with: {
                navigation: true,
            },
        });
        if (!item || item.navigation.tenantId !== tenantId) {
            throw new common_1.NotFoundException(`Navigation item with ID ${itemId} not found`);
        }
        await this.db.delete(schema_1.navigationItems).where((0, drizzle_orm_1.eq)(schema_1.navigationItems.id, itemId));
        return true;
    }
    async reorderNavigationItems(navigationId, tenantId, itemOrders) {
        await this.findOne(navigationId, tenantId);
        for (const { id, order } of itemOrders) {
            await this.db
                .update(schema_1.navigationItems)
                .set({ order })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.navigationItems.id, id), (0, drizzle_orm_1.eq)(schema_1.navigationItems.navigationId, navigationId)));
        }
        return true;
    }
};
exports.NavigationService = NavigationService;
exports.NavigationService = NavigationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], NavigationService);
//# sourceMappingURL=navigation.service.js.map