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
exports.SeoService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../../core/database/drizzle.module");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
let SeoService = class SeoService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getSeoMeta(entityType, entityId) {
        const [meta] = await this.db
            .select()
            .from(schema_1.seoMeta)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.seoMeta.entityType, entityType), (0, drizzle_orm_1.eq)(schema_1.seoMeta.entityId, entityId)))
            .limit(1);
        return meta;
    }
    async upsertSeoMeta(entityType, entityId, input) {
        const existing = await this.getSeoMeta(entityType, entityId);
        if (existing) {
            const [updated] = await this.db
                .update(schema_1.seoMeta)
                .set({
                ...input,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.seoMeta.id, existing.id))
                .returning();
            return updated;
        }
        const [created] = await this.db
            .insert(schema_1.seoMeta)
            .values({
            entityType,
            entityId,
            ...input,
        })
            .returning();
        return created;
    }
    async deleteSeoMeta(entityType, entityId) {
        await this.db
            .delete(schema_1.seoMeta)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.seoMeta.entityType, entityType), (0, drizzle_orm_1.eq)(schema_1.seoMeta.entityId, entityId)));
        return true;
    }
};
exports.SeoService = SeoService;
exports.SeoService = SeoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], SeoService);
//# sourceMappingURL=seo.service.js.map