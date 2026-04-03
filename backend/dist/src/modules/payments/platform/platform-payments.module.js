"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformPaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const platform_payments_resolver_1 = require("./platform-payments.resolver");
const platform_payments_service_1 = require("./platform-payments.service");
const drizzle_module_1 = require("../../../core/database/drizzle.module");
let PlatformPaymentsModule = class PlatformPaymentsModule {
};
exports.PlatformPaymentsModule = PlatformPaymentsModule;
exports.PlatformPaymentsModule = PlatformPaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [drizzle_module_1.DrizzleModule],
        providers: [platform_payments_resolver_1.PlatformPaymentsResolver, platform_payments_service_1.PlatformPaymentsService],
        exports: [platform_payments_service_1.PlatformPaymentsService],
    })
], PlatformPaymentsModule);
//# sourceMappingURL=platform-payments.module.js.map