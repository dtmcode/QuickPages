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
exports.CustomerAuthController = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../core/database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt = __importStar(require("bcryptjs"));
const jwt_1 = require("@nestjs/jwt");
let CustomerAuthController = class CustomerAuthController {
    db;
    jwtService;
    constructor(db, jwtService) {
        this.db = db;
        this.jwtService = jwtService;
    }
    verifyToken(auth) {
        if (!auth?.startsWith('Bearer '))
            throw new common_1.UnauthorizedException();
        try {
            const payload = this.jwtService.verify(auth.split(' ')[1]);
            return payload;
        }
        catch {
            throw new common_1.UnauthorizedException();
        }
    }
    async register(slug, body) {
        const [tenant] = await this.db
            .select()
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenants.slug, slug), (0, drizzle_orm_1.eq)(schema_1.tenants.isActive, true)))
            .limit(1);
        if (!tenant)
            throw new common_1.UnauthorizedException('Tenant nicht gefunden');
        const existing = await this.db
            .select()
            .from(schema_1.tenantCustomers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenantCustomers.tenantId, tenant.id), (0, drizzle_orm_1.eq)(schema_1.tenantCustomers.email, body.email)))
            .limit(1);
        if (existing.length > 0)
            throw new common_1.UnauthorizedException('E-Mail bereits registriert');
        const passwordHash = await bcrypt.hash(body.password, 10);
        const [customer] = await this.db
            .insert(schema_1.tenantCustomers)
            .values({
            tenantId: tenant.id,
            email: body.email,
            passwordHash,
            firstName: body.firstName,
            lastName: body.lastName,
            isActive: true,
        })
            .returning();
        const accessToken = this.jwtService.sign({ customerId: customer.id, tenantId: tenant.id, type: 'customer' }, { expiresIn: '7d' });
        return {
            accessToken,
            customer: {
                id: customer.id,
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
            },
        };
    }
    async login(slug, body) {
        const [tenant] = await this.db
            .select()
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenants.slug, slug), (0, drizzle_orm_1.eq)(schema_1.tenants.isActive, true)))
            .limit(1);
        if (!tenant)
            throw new common_1.UnauthorizedException('Tenant nicht gefunden');
        const [customer] = await this.db
            .select()
            .from(schema_1.tenantCustomers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tenantCustomers.tenantId, tenant.id), (0, drizzle_orm_1.eq)(schema_1.tenantCustomers.email, body.email), (0, drizzle_orm_1.eq)(schema_1.tenantCustomers.isActive, true)))
            .limit(1);
        if (!customer)
            throw new common_1.UnauthorizedException('Ungültige Anmeldedaten');
        const valid = await bcrypt.compare(body.password, customer.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Ungültige Anmeldedaten');
        const accessToken = this.jwtService.sign({ customerId: customer.id, tenantId: tenant.id, type: 'customer' }, { expiresIn: '7d' });
        return {
            accessToken,
            customer: {
                id: customer.id,
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
            },
        };
    }
    async me(auth) {
        const payload = this.verifyToken(auth);
        const [customer] = await this.db
            .select()
            .from(schema_1.tenantCustomers)
            .where((0, drizzle_orm_1.eq)(schema_1.tenantCustomers.id, payload.customerId))
            .limit(1);
        if (!customer)
            throw new common_1.UnauthorizedException();
        return {
            id: customer.id,
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
        };
    }
    async getOrders(auth) {
        const payload = this.verifyToken(auth);
        const [customer] = await this.db
            .select()
            .from(schema_1.tenantCustomers)
            .where((0, drizzle_orm_1.eq)(schema_1.tenantCustomers.id, payload.customerId))
            .limit(1);
        if (!customer)
            throw new common_1.UnauthorizedException();
        return this.db
            .select()
            .from(schema_1.orders)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.orders.tenantId, payload.tenantId), (0, drizzle_orm_1.eq)(schema_1.orders.customerEmail, customer.email)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.orders.createdAt));
    }
    async updateProfile(auth, body) {
        const payload = this.verifyToken(auth);
        await this.db
            .update(schema_1.tenantCustomers)
            .set({
            firstName: body.firstName,
            lastName: body.lastName,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.tenantCustomers.id, payload.customerId));
        const [customer] = await this.db
            .select()
            .from(schema_1.tenantCustomers)
            .where((0, drizzle_orm_1.eq)(schema_1.tenantCustomers.id, payload.customerId))
            .limit(1);
        return {
            id: customer.id,
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
        };
    }
};
exports.CustomerAuthController = CustomerAuthController;
__decorate([
    (0, common_1.Post)('auth/register'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerAuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('auth/login'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerAuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('auth/me'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerAuthController.prototype, "me", null);
__decorate([
    (0, common_1.Get)('account/orders'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerAuthController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Put)('account/profile'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomerAuthController.prototype, "updateProfile", null);
exports.CustomerAuthController = CustomerAuthController = __decorate([
    (0, common_1.Controller)('api/public/:tenant'),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService])
], CustomerAuthController);
//# sourceMappingURL=customer-auth.controller.js.map