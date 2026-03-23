import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';
import { EmailSettingsService } from './email-settings.service';
import { EmailCryptoService } from './email-crypto.service';
import { EmailSettingsResolver } from './email-settings.resolver';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [
    EmailService,
    EmailProcessor,
    EmailSettingsService,
    EmailCryptoService,
    EmailSettingsResolver,
  ],
  exports: [EmailService, EmailSettingsService],
})
export class EmailModule {}
