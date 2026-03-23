import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull'; // ← import type!
import { EmailService } from './email.service';

@Processor('email')
export class EmailProcessor {
  constructor(private readonly emailService: EmailService) {}

  @Process('welcome')
  async handleWelcomeEmail(job: Job) {
    const { data, tenantId } = job.data;
    await this.emailService.sendWelcomeEmail(data, tenantId);
  }

  @Process('order-confirmation')
  async handleOrderConfirmation(job: Job) {
    const { data, tenantId } = job.data;
    await this.emailService.sendOrderConfirmation(data, tenantId);
  }

  @Process('password-reset')
  async handlePasswordReset(job: Job) {
    const { data } = job.data;
    await this.emailService.sendPasswordReset(data);
  }
}
