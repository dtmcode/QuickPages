"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
const email_service_1 = require("./email.service");
const email_processor_1 = require("./email.processor");
const email_settings_service_1 = require("./email-settings.service");
const email_crypto_service_1 = require("./email-crypto.service");
const email_settings_resolver_1 = require("./email-settings.resolver");
let EmailModule = class EmailModule {
};
exports.EmailModule = EmailModule;
exports.EmailModule = EmailModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            bull_1.BullModule.registerQueue({
                name: 'email',
            }),
        ],
        providers: [
            email_service_1.EmailService,
            email_processor_1.EmailProcessor,
            email_settings_service_1.EmailSettingsService,
            email_crypto_service_1.EmailCryptoService,
            email_settings_resolver_1.EmailSettingsResolver,
        ],
        exports: [email_service_1.EmailService, email_settings_service_1.EmailSettingsService],
    })
], EmailModule);
//# sourceMappingURL=email.module.js.map