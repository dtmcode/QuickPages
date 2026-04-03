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
exports.PackageGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const graphql_1 = require("@nestjs/graphql");
const require_feature_decorator_1 = require("../decorators/require-feature.decorator");
const package_helper_1 = require("../package.helper");
const drizzle_module_1 = require("../../database/drizzle.module");
const common_2 = require("@nestjs/common");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const SUPERADMIN_SLUGS = ['myquickpages', 'platform-admin'];
let PackageGuard = class PackageGuard {
    reflector;
    db;
    constructor(reflector, db) {
        this.reflector = reflector;
        this.db = db;
    }
    async canActivate(context) {
        const requiredFeature = this.reflector.getAllAndOverride(require_feature_decorator_1.REQUIRE_FEATURE_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredFeature)
            return true;
        const ctx = graphql_1.GqlExecutionContext.create(context);
        const request = ctx.getContext().req;
        const tenantId = request.user?.tenantId;
        if (!tenantId)
            throw new Error('Tenant ID nicht gefunden');
        const [tenant] = await this.db
            .select()
            .from(schema_1.tenants)
            .where((0, drizzle_orm_1.eq)(schema_1.tenants.id, tenantId))
            .limit(1);
        if (!tenant)
            throw new Error('Tenant nicht gefunden');
        if (SUPERADMIN_SLUGS.includes(tenant.slug))
            return true;
        const settings = tenant.settings;
        if (settings?.isSuperAdmin === true || settings?.platformAdmin === true)
            return true;
        const hasAccess = (0, package_helper_1.hasFeature)(tenant.package, requiredFeature);
        if (!hasAccess) {
            throw new Error(`Diese Funktion ist in deinem ${tenant.package.toUpperCase()} Package nicht verfügbar.`);
        }
        return true;
    }
};
exports.PackageGuard = PackageGuard;
exports.PackageGuard = PackageGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_2.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [core_1.Reflector, Object])
], PackageGuard);
//# sourceMappingURL=package.guard.js.map