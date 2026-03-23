// 📂 PFAD: backend/src/modules/support/support.resolver.ts
import { Resolver, Query, Mutation, Args, ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../core/auth/decorators/tenant-id.decorator';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator';
import type { JwtPayload } from '../../core/auth/strategies/jwt.strategy';
import { SupportService } from './support.service';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
class SupportTicketType {
  @Field() id: string;
  @Field() ticketNumber: string;
  @Field() subject: string;
  @Field() status: string;
  @Field() priority: string;
  @Field() customerName: string;
  @Field() customerEmail: string;
  @Field({ nullable: true }) assignedTo?: string;
  @Field(() => Int) messageCount: number;
  @Field({ nullable: true }) lastMessage?: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}

@ObjectType()
class SupportMessageType {
  @Field() id: string;
  @Field() ticketId: string;
  @Field() authorName: string;
  @Field() authorEmail: string;
  @Field() content: string;
  @Field() isStaff: boolean;
  @Field() isInternal: boolean;
  @Field() createdAt: Date;
}

@ObjectType()
class SupportStatsType {
  @Field(() => Int) open: number;
  @Field(() => Int) waiting: number;
  @Field(() => Int) resolved: number;
  @Field(() => Int) closed: number;
  @Field(() => Int) urgent: number;
  @Field(() => Int) total: number;
}

@InputType()
class CreateTicketInput {
  @Field() subject: string;
  @Field() customerName: string;
  @Field() customerEmail: string;
  @Field() message: string;
  @Field({ nullable: true }) priority?: string;
}

@InputType()
class UpdateTicketInput {
  @Field({ nullable: true }) status?: string;
  @Field({ nullable: true }) priority?: string;
  @Field({ nullable: true }) assignedTo?: string;
}

@Resolver()
export class SupportResolver {
  constructor(private supportService: SupportService) {}

  @Query(() => [SupportTicketType])
  @UseGuards(GqlAuthGuard)
  async supportTickets(
    @TenantId() tenantId: string,
    @Args('status', { nullable: true }) status?: string,
    @Args('priority', { nullable: true }) priority?: string,
  ) {
    const rows = await this.supportService.getTickets(tenantId, { status, priority });
    return rows.map((r: any) => ({
      id: r.id,
      ticketNumber: r.ticket_number,
      subject: r.subject,
      status: r.status,
      priority: r.priority,
      customerName: r.customer_name,
      customerEmail: r.customer_email,
      assignedTo: r.assigned_to,
      messageCount: parseInt(r.message_count) || 0,
      lastMessage: r.last_message,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  @Query(() => SupportStatsType)
  @UseGuards(GqlAuthGuard)
  async supportStats(@TenantId() tenantId: string) {
    return this.supportService.getStats(tenantId);
  }

  @Query(() => [SupportMessageType])
  @UseGuards(GqlAuthGuard)
  async ticketMessages(
    @Args('ticketId') ticketId: string,
    @TenantId() tenantId: string,
  ) {
    // Verify ownership
    const ticket = await this.supportService.getTicket(tenantId, ticketId);
    if (!ticket) throw new Error('Ticket nicht gefunden');
    const rows = await this.supportService.getMessages(ticketId, true);
    return rows.map((r: any) => ({
      id: r.id,
      ticketId: r.ticket_id,
      authorName: r.author_name,
      authorEmail: r.author_email,
      content: r.content,
      isStaff: r.is_staff,
      isInternal: r.is_internal,
      createdAt: r.created_at,
    }));
  }

  @Mutation(() => SupportTicketType)
  @UseGuards(GqlAuthGuard)
  async updateSupportTicket(
    @Args('id') id: string,
    @Args('input') input: UpdateTicketInput,
    @TenantId() tenantId: string,
  ) {
    const r = await this.supportService.updateTicket(tenantId, id, input);
    return {
      id: r.id, ticketNumber: r.ticket_number, subject: r.subject,
      status: r.status, priority: r.priority, customerName: r.customer_name,
      customerEmail: r.customer_email, assignedTo: r.assigned_to,
      messageCount: 0, createdAt: r.created_at, updatedAt: r.updated_at,
    };
  }

  @Mutation(() => SupportMessageType)
  @UseGuards(GqlAuthGuard)
  async replyToTicket(
    @Args('ticketId') ticketId: string,
    @Args('content') content: string,
    @Args('isInternal', { defaultValue: false }) isInternal: boolean,
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const r = await this.supportService.addMessage(tenantId, ticketId, {
      authorName: 'Support',
      authorEmail: 'support@platform.com',
      content,
      isStaff: true,
      isInternal,
    });
    return {
      id: r.id, ticketId: r.ticket_id, authorName: r.author_name,
      authorEmail: r.author_email, content: r.content,
      isStaff: r.is_staff, isInternal: r.is_internal, createdAt: r.created_at,
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteSupportTicket(
    @Args('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.supportService.deleteTicket(tenantId, id);
  }
}