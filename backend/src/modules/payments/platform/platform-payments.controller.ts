// 📂 PFAD: backend/src/modules/payments/platform/platform-payments.controller.ts
// REST Controller nur für Stripe Webhook (braucht Raw Body)
//
// In main.ts hinzufügen BEVOR json middleware:
//   app.use('/payments/webhook', express.raw({ type: 'application/json' }));

import { Controller, Post, Req, Headers, BadRequestException, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PlatformPaymentsService } from './platform-payments.service';

@Controller('payments')
export class PlatformPaymentsController {
  constructor(private readonly platformPaymentsService: PlatformPaymentsService) {}

  @Post('webhook')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) throw new BadRequestException('stripe-signature Header fehlt');

    const rawBody = req.rawBody;
    if (!rawBody) throw new BadRequestException('Raw body fehlt — prüfe main.ts Setup');

    try {
      await this.platformPaymentsService.handleWebhook(rawBody, signature);
      return { received: true };
    } catch (err: any) {
      console.error('❌ Stripe Webhook Fehler:', err.message);
      throw new BadRequestException(err.message);
    }
  }
}