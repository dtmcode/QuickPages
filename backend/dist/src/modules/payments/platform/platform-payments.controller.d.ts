import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PlatformPaymentsService } from './platform-payments.service';
export declare class PlatformPaymentsController {
    private readonly platformPaymentsService;
    constructor(platformPaymentsService: PlatformPaymentsService);
    handleStripeWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
}
