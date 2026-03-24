// 📂 PFAD: backend/src/modules/support/support-public.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SupportService } from './support.service';

@Controller('api/public/:tenant/support')
export class SupportPublicController {
  constructor(private supportService: SupportService) {}

  @Post('ticket')
  async createTicket(
    @Param('tenant') slug: string,
    @Body()
    body: {
      subject: string;
      customerName: string;
      customerEmail: string;
      message: string;
      priority?: string;
    },
  ) {
    const tenantId = await this.supportService.getTenantIdBySlug(slug);
    if (!tenantId)
      throw new HttpException('Nicht gefunden', HttpStatus.NOT_FOUND);
    if (
      !body.subject ||
      !body.customerName ||
      !body.customerEmail ||
      !body.message
    ) {
      throw new HttpException(
        'Alle Pflichtfelder ausfüllen',
        HttpStatus.BAD_REQUEST,
      );
    }
    const ticket = await this.supportService.createTicket(tenantId, body);
    return {
      success: true,
      ticketNumber: ticket.ticket_number,
      token: ticket.token,
    };
  }

  @Get('ticket/:token')
  async getTicket(
    @Param('tenant') slug: string,
    @Param('token') token: string,
  ) {
    const ticket = await this.supportService.getTicketByToken(token);
    if (!ticket)
      throw new HttpException('Ticket nicht gefunden', HttpStatus.NOT_FOUND);
    const messages = await this.supportService.getMessages(ticket.id, false);
    return { ticket, messages };
  }

  @Post('ticket/:token/reply')
  async reply(
    @Param('token') token: string,
    @Body() body: { authorName: string; authorEmail: string; content: string },
  ) {
    if (!body.content)
      throw new HttpException(
        'Nachricht darf nicht leer sein',
        HttpStatus.BAD_REQUEST,
      );
    try {
      await this.supportService.addPublicMessage(token, body);
      return { success: true };
    } catch (err: unknown) {
      throw new HttpException(
        err instanceof Error ? err.message : 'Fehler',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
