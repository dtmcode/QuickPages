"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const subscriber_service_1 = require("./subscriber.service");
const subscriber_resolver_1 = require("./subscriber.resolver");
const campaign_service_1 = require("./campaign.service");
const campaign_resolver_1 = require("./campaign.resolver");
const newsletter_processor_1 = require("./newsletter.processor");
const email_module_1 = require("../../core/email/email.module");
let NewsletterModule = class NewsletterModule {
};
exports.NewsletterModule = NewsletterModule;
exports.NewsletterModule = NewsletterModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bull_1.BullModule.registerQueue({
                name: 'newsletter',
            }),
            email_module_1.EmailModule,
        ],
        providers: [
            subscriber_service_1.SubscriberService,
            subscriber_resolver_1.SubscriberResolver,
            campaign_service_1.CampaignService,
            campaign_resolver_1.CampaignResolver,
            newsletter_processor_1.NewsletterProcessor,
        ],
        exports: [subscriber_service_1.SubscriberService, campaign_service_1.CampaignService],
    })
], NewsletterModule);
//# sourceMappingURL=newsletter.module.js.map