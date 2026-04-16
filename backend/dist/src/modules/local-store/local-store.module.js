"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStoreModule = void 0;
const common_1 = require("@nestjs/common");
const local_store_resolver_1 = require("./local-store.resolver");
const local_store_service_1 = require("./local-store.service");
const drizzle_module_1 = require("../../core/database/drizzle.module");
let LocalStoreModule = class LocalStoreModule {
};
exports.LocalStoreModule = LocalStoreModule;
exports.LocalStoreModule = LocalStoreModule = __decorate([
    (0, common_1.Module)({
        imports: [drizzle_module_1.DrizzleModule],
        providers: [local_store_resolver_1.LocalStoreResolver, local_store_service_1.LocalStoreService],
        exports: [local_store_service_1.LocalStoreService],
    })
], LocalStoreModule);
//# sourceMappingURL=local-store.module.js.map