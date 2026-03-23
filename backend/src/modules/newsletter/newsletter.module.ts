import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SubscriberService } from './subscriber.service';
import { SubscriberResolver } from './subscriber.resolver';
import { CampaignService } from './campaign.service';
import { CampaignResolver } from './campaign.resolver';
import { NewsletterProcessor } from './newsletter.processor';
import { EmailModule } from '../../core/email/email.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'newsletter',
    }),
    EmailModule,
  ],
  providers: [
    SubscriberService,
    SubscriberResolver,
    CampaignService,
    CampaignResolver,
    NewsletterProcessor,
  ],
  exports: [SubscriberService, CampaignService],
})
export class NewsletterModule {}
