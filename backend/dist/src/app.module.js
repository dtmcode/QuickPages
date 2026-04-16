"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const bull_1 = require("@nestjs/bull");
const path_1 = require("path");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
const configuration_1 = __importDefault(require("./config/configuration"));
const drizzle_module_1 = require("./core/database/drizzle.module");
const auth_module_1 = require("./core/auth/auth.module");
const cms_module_1 = require("./modules/cms/cms.module");
const shop_module_1 = require("./modules/shop/shop.module");
const package_module_1 = require("./core/package/package.module");
const email_module_1 = require("./core/email/email.module");
const newsletter_module_1 = require("./modules/newsletter/newsletter.module");
const navigation_module_1 = require("./modules/navigation/navigation.module");
const public_module_1 = require("./modules/public/public.module");
const website_builder_module_1 = require("./modules/website-builder/website-builder.module");
const gql_throttler_guard_1 = require("./core/auth/guards/gql-throttler.guard");
const schedule_1 = require("@nestjs/schedule");
const booking_module_1 = require("./modules/booking/booking.module");
const comments_module_1 = require("./modules/comments/comments.module");
const form_builder_module_1 = require("./modules/forms/form-builder.module");
const i18n_module_1 = require("./modules/i18n/i18n.module");
const ai_content_module_1 = require("./modules/ai-content/ai-content.module");
const white_label_module_1 = require("./modules/white-label/white-label.module");
const support_module_1 = require("./modules/support/support.module");
const domain_module_1 = require("./modules/domain/domain.module");
const customer_auth_module_1 = require("./modules/customer-auth/customer-auth.module");
const restaurant_module_1 = require("./modules/restaurant/restaurant.module");
const local_store_module_1 = require("./modules/local-store/local-store.module");
const funnels_module_1 = require("./modules/funnels/funnels.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            bull_1.BullModule.forRoot({
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                    password: process.env.REDIS_PASSWORD || undefined,
                },
            }),
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                autoSchemaFile: (0, path_1.join)(process.cwd(), 'src/schema.gql'),
                sortSchema: true,
                playground: process.env.NODE_ENV !== 'production',
                context: ({ req, res }) => ({ req, res }),
                resolvers: { JSON: graphql_type_json_1.default },
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            drizzle_module_1.DrizzleModule,
            auth_module_1.AuthModule,
            domain_module_1.DomainModule,
            cms_module_1.CmsModule,
            shop_module_1.ShopModule,
            package_module_1.PackageModule,
            email_module_1.EmailModule,
            newsletter_module_1.NewsletterModule,
            navigation_module_1.NavigationModule,
            public_module_1.PublicModule,
            website_builder_module_1.WebsiteBuilderModule,
            booking_module_1.BookingModule,
            comments_module_1.CommentsModule,
            form_builder_module_1.FormBuilderModule,
            i18n_module_1.I18nModule,
            ai_content_module_1.AiContentModule,
            white_label_module_1.WhiteLabelModule,
            support_module_1.SupportModule,
            customer_auth_module_1.CustomerAuthModule,
            restaurant_module_1.RestaurantModule,
            funnels_module_1.FunnelsModule,
            local_store_module_1.LocalStoreModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: gql_throttler_guard_1.GqlThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map