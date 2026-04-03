"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantPaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const tenant_payments_resolver_1 = require("./tenant-payments.resolver");
const tenant_payments_service_1 = require("./tenant-payments.service");
let TenantPaymentsModule = class TenantPaymentsModule {
};
exports.TenantPaymentsModule = TenantPaymentsModule;
exports.TenantPaymentsModule = TenantPaymentsModule = __decorate([
    (0, common_1.Module)({
        providers: [tenant_payments_resolver_1.TenantPaymentsResolver, tenant_payments_service_1.TenantPaymentsService],
        exports: [tenant_payments_service_1.TenantPaymentsService],
    })
], TenantPaymentsModule);
//# sourceMappingURL=tenant-payments.module.js.map