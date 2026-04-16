// 📂 PFAD: backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { join } from 'path';
import GraphQLJSON from 'graphql-type-json';
import configuration from './config/configuration';
import { DrizzleModule } from './core/database/drizzle.module';
import { AuthModule } from './core/auth/auth.module';
import { CmsModule } from './modules/cms/cms.module';
import { ShopModule } from './modules/shop/shop.module';
import { PackageModule } from './core/package/package.module';
import { EmailModule } from './core/email/email.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { NavigationModule } from './modules/navigation/navigation.module';
import { PublicModule } from './modules/public/public.module';
import { WebsiteBuilderModule } from './modules/website-builder/website-builder.module';
import { GqlThrottlerGuard } from './core/auth/guards/gql-throttler.guard';

import { ScheduleModule } from '@nestjs/schedule';
import { BookingModule } from './modules/booking/booking.module';
import { CommentsModule } from './modules/comments/comments.module';
import { FormBuilderModule } from './modules/forms/form-builder.module';
import { I18nModule } from './modules/i18n/i18n.module';
import { AiContentModule } from './modules/ai-content/ai-content.module';
import { WhiteLabelModule } from './modules/white-label/white-label.module';
import { SupportModule } from './modules/support/support.module';
import { DomainModule } from './modules/domain/domain.module';
import { CustomerAuthModule } from './modules/customer-auth/customer-auth.module';
import { RestaurantModule } from './modules/restaurant/restaurant.module';
import { LocalStoreModule } from './modules/local-store/local-store.module';
import { FunnelsModule } from './modules/funnels/funnels.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { CoursesModule } from './modules/courses/courses.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),

      resolvers: { JSON: GraphQLJSON },
    }),

    // ✅ Rate Limiting: 100 Requests pro Minute (Public), 300 für Auth
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    DrizzleModule,
    AuthModule,
    DomainModule,
    CmsModule,
    ShopModule,
    PackageModule,
    EmailModule,
    NewsletterModule,
    NavigationModule,
    PublicModule,
    WebsiteBuilderModule,
    BookingModule,
    CommentsModule,
    FormBuilderModule,
    I18nModule,
    AiContentModule,
    WhiteLabelModule,
    SupportModule,
    CustomerAuthModule,
    CoursesModule,
    FunnelsModule,
    RestaurantModule,
    LocalStoreModule,
    CouponsModule,
  ],
  providers: [
    // ✅ Rate Limiting global als Guard
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
})
export class AppModule {}
