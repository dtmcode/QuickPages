// 📂 backend/src/modules/customer-auth/customer-auth.module.ts

import { Module } from '@nestjs/common';
import { CustomerAuthController } from './customer-auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'fallback-secret'),
      }),
    }),
  ],
  controllers: [CustomerAuthController],
})
export class CustomerAuthModule {}
