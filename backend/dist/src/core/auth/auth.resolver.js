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
exports.AuthResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_types_1 = require("./dto/auth.types");
const auth_input_1 = require("./dto/auth.input");
const gql_auth_guard_1 = require("./guards/gql-auth.guard");
const current_user_decorator_1 = require("./decorators/current-user.decorator");
const tenant_id_decorator_1 = require("./decorators/tenant-id.decorator");
const drizzle_module_1 = require("../database/drizzle.module");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
let AuthResolver = class AuthResolver {
    authService;
    db;
    constructor(authService, db) {
        this.authService = authService;
        this.db = db;
    }
    hello() {
        return 'Hello from GraphQL API!';
    }
    async register(input) {
        return await this.authService.register(input);
    }
    async login(input) {
        return await this.authService.login(input);
    }
    async refreshToken(input) {
        return await this.authService.refreshToken(input.refreshToken);
    }
    async forgotPassword(input) {
        return await this.authService.forgotPassword(input);
    }
    async resetPassword(input) {
        return await this.authService.resetPassword(input);
    }
    async verifyEmail(input) {
        return await this.authService.verifyEmail(input);
    }
    async resendVerificationEmail(currentUser) {
        return await this.authService.resendVerificationEmail(currentUser.userId);
    }
    async me(currentUser) {
        const result = await this.db
            .select({ user: schema_1.users, tenant: schema_1.tenants })
            .from(schema_1.users)
            .innerJoin(schema_1.tenants, (0, drizzle_orm_1.eq)(schema_1.users.tenantId, schema_1.tenants.id))
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, currentUser.userId))
            .limit(1);
        if (result.length === 0) {
            throw new Error('User nicht gefunden');
        }
        const { user, tenant } = result[0];
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName ?? undefined,
                lastName: user.lastName ?? undefined,
                role: user.role,
                isActive: user.isActive ?? true,
                emailVerified: user.emailVerified ?? false,
                lastLoginAt: user.lastLoginAt ?? undefined,
                createdAt: user.createdAt ?? new Date(),
            },
            tenant: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                domain: tenant.domain ?? undefined,
                package: tenant.package,
                shopTemplate: tenant.shopTemplate ?? undefined,
                isActive: tenant.isActive ?? true,
                createdAt: tenant.createdAt ?? new Date(),
            },
        };
    }
    async currentTenant(currentUser) {
        const result = await this.db
            .select({ user: schema_1.users, tenant: schema_1.tenants })
            .from(schema_1.users)
            .innerJoin(schema_1.tenants, (0, drizzle_orm_1.eq)(schema_1.users.tenantId, schema_1.tenants.id))
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, currentUser.userId))
            .limit(1);
        if (result.length === 0) {
            throw new Error('Tenant nicht gefunden');
        }
        const { user, tenant } = result[0];
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName ?? undefined,
                lastName: user.lastName ?? undefined,
                role: user.role,
                isActive: user.isActive ?? true,
                emailVerified: user.emailVerified ?? false,
                lastLoginAt: user.lastLoginAt ?? undefined,
                createdAt: user.createdAt ?? new Date(),
            },
            tenant: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                domain: tenant.domain ?? undefined,
                package: tenant.package,
                shopTemplate: tenant.shopTemplate ?? undefined,
                isActive: tenant.isActive ?? true,
                createdAt: tenant.createdAt ?? new Date(),
            },
        };
    }
    async updateShopTemplate(template, tenantId, currentUser) {
        if (currentUser.role !== 'owner') {
            throw new Error('Nur der Owner kann das Shop-Template ändern');
        }
        await this.db
            .update(schema_1.tenants)
            .set({
            shopTemplate: template,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId));
        const result = await this.db
            .select({ user: schema_1.users, tenant: schema_1.tenants })
            .from(schema_1.users)
            .innerJoin(schema_1.tenants, (0, drizzle_orm_1.eq)(schema_1.users.tenantId, schema_1.tenants.id))
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, currentUser.userId))
            .limit(1);
        if (result.length === 0) {
            throw new Error('Tenant nicht gefunden');
        }
        const { user, tenant } = result[0];
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName ?? undefined,
                lastName: user.lastName ?? undefined,
                role: user.role,
                isActive: user.isActive ?? true,
                emailVerified: user.emailVerified ?? false,
                lastLoginAt: user.lastLoginAt ?? undefined,
                createdAt: user.createdAt ?? new Date(),
            },
            tenant: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                domain: tenant.domain ?? undefined,
                package: tenant.package,
                shopTemplate: tenant.shopTemplate ?? undefined,
                isActive: tenant.isActive ?? true,
                createdAt: tenant.createdAt ?? new Date(),
            },
        };
    }
};
exports.AuthResolver = AuthResolver;
__decorate([
    (0, graphql_1.Query)(() => String),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AuthResolver.prototype, "hello", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_types_1.AuthResponse),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_input_1.RegisterInput]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "register", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_types_1.AuthResponse),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_input_1.LoginInput]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "login", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_types_1.AuthResponse),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_input_1.RefreshTokenInput]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "refreshToken", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_types_1.SuccessResponse),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_input_1.ForgotPasswordInput]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "forgotPassword", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_types_1.SuccessResponse),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_input_1.ResetPasswordInput]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "resetPassword", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_types_1.SuccessResponse),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_input_1.VerifyEmailInput]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "verifyEmail", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_types_1.SuccessResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "resendVerificationEmail", null);
__decorate([
    (0, graphql_1.Query)(() => auth_types_1.CurrentUserResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "me", null);
__decorate([
    (0, graphql_1.Query)(() => auth_types_1.CurrentUserResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "currentTenant", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_types_1.CurrentUserResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('template')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "updateShopTemplate", null);
exports.AuthResolver = AuthResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __param(1, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [auth_service_1.AuthService, Object])
], AuthResolver);
//# sourceMappingURL=auth.resolver.js.map