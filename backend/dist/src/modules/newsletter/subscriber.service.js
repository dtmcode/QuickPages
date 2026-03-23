"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriberService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto = __importStar(require("crypto"));
let SubscriberService = class SubscriberService {
    db;
    constructor(db) {
        this.db = db;
    }
    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    async createSubscriber(tenantId, input) {
        const [existing] = await this.db
            .select()
            .from(schema_1.newsletterSubscribers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.email, input.email.toLowerCase())))
            .limit(1);
        if (existing) {
            if (existing.status === 'unsubscribed') {
                return this.updateSubscriber(tenantId, existing.id, {
                    status: 'pending',
                });
            }
            throw new Error('Subscriber already exists');
        }
        const [subscriber] = await this.db
            .insert(schema_1.newsletterSubscribers)
            .values({
            tenantId,
            email: input.email.toLowerCase(),
            firstName: input.firstName,
            lastName: input.lastName,
            tags: input.tags || [],
            customFields: input.customFields,
            source: input.source || 'manual',
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
            status: 'pending',
            subscribedAt: new Date(),
            unsubscribeToken: this.generateToken(),
            confirmToken: this.generateToken(),
        })
            .returning();
        return subscriber;
    }
    async getSubscribers(tenantId, options) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.tenantId, tenantId)];
        if (options?.status) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.status, options.status));
        }
        if (options?.tags && options.tags.length > 0) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.tags, options.tags));
        }
        if (options?.search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.newsletterSubscribers.email, `%${options.search}%`), (0, drizzle_orm_1.like)(schema_1.newsletterSubscribers.firstName, `%${options.search}%`), (0, drizzle_orm_1.like)(schema_1.newsletterSubscribers.lastName, `%${options.search}%`)));
        }
        const query = this.db
            .select()
            .from(schema_1.newsletterSubscribers)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.newsletterSubscribers.createdAt));
        if (options?.limit) {
            query.limit(options.limit);
        }
        if (options?.offset) {
            query.offset(options.offset);
        }
        return query;
    }
    async getSubscriber(tenantId, subscriberId) {
        const [subscriber] = await this.db
            .select()
            .from(schema_1.newsletterSubscribers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.id, subscriberId)))
            .limit(1);
        return subscriber;
    }
    async getSubscriberByEmail(tenantId, email) {
        const [subscriber] = await this.db
            .select()
            .from(schema_1.newsletterSubscribers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.email, email.toLowerCase())))
            .limit(1);
        return subscriber;
    }
    async updateSubscriber(tenantId, subscriberId, input) {
        const updateData = {
            firstName: input.firstName,
            lastName: input.lastName,
            tags: input.tags,
            customFields: input.customFields,
            ...(input.status && { status: input.status }),
            updatedAt: new Date(),
        };
        const [updated] = await this.db
            .update(schema_1.newsletterSubscribers)
            .set(updateData)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.id, subscriberId)))
            .returning();
        return updated;
    }
    async deleteSubscriber(tenantId, subscriberId) {
        await this.db
            .delete(schema_1.newsletterSubscribers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.id, subscriberId)));
        return true;
    }
    async confirmSubscription(tenantId, confirmToken) {
        const [subscriber] = await this.db
            .select()
            .from(schema_1.newsletterSubscribers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.confirmToken, confirmToken)))
            .limit(1);
        if (!subscriber) {
            throw new Error('Invalid confirmation token');
        }
        if (subscriber.status === 'active') {
            throw new Error('Already confirmed');
        }
        const [updated] = await this.db
            .update(schema_1.newsletterSubscribers)
            .set({
            status: 'active',
            confirmedAt: new Date(),
            confirmToken: null,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.id, subscriber.id))
            .returning();
        return updated;
    }
    async unsubscribe(tenantId, unsubscribeToken) {
        const [subscriber] = await this.db
            .select()
            .from(schema_1.newsletterSubscribers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.unsubscribeToken, unsubscribeToken)))
            .limit(1);
        if (!subscriber) {
            throw new Error('Invalid unsubscribe token');
        }
        const [updated] = await this.db
            .update(schema_1.newsletterSubscribers)
            .set({
            status: 'unsubscribed',
            unsubscribedAt: new Date(),
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.id, subscriber.id))
            .returning();
        return updated;
    }
    async getSubscriberCount(tenantId, status) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.tenantId, tenantId)];
        if (status) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.status, status));
        }
        const result = await this.db
            .select()
            .from(schema_1.newsletterSubscribers)
            .where((0, drizzle_orm_1.and)(...conditions));
        return result.length;
    }
    async bulkImport(tenantId, subscribers) {
        const results = {
            success: 0,
            failed: 0,
            skipped: 0,
            errors: [],
        };
        for (const sub of subscribers) {
            try {
                await this.createSubscriber(tenantId, sub);
                results.success++;
            }
            catch (error) {
                if (error.message === 'Subscriber already exists') {
                    results.skipped++;
                }
                else {
                    results.failed++;
                    results.errors.push(`${sub.email}: ${error.message}`);
                }
            }
        }
        return results;
    }
    async getTags(tenantId) {
        const subscribers = await this.db
            .select({ tags: schema_1.newsletterSubscribers.tags })
            .from(schema_1.newsletterSubscribers)
            .where((0, drizzle_orm_1.eq)(schema_1.newsletterSubscribers.tenantId, tenantId));
        const allTags = subscribers
            .flatMap((s) => s.tags || [])
            .filter((tag, index, self) => self.indexOf(tag) === index);
        return allTags;
    }
};
exports.SubscriberService = SubscriberService;
exports.SubscriberService = SubscriberService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], SubscriberService);
//# sourceMappingURL=subscriber.service.js.map