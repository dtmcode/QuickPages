"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../core/auth/guards/gql-auth.guard");
const tenant_id_decorator_1 = require("../../core/auth/decorators/tenant-id.decorator");
const current_user_decorator_1 = require("../../core/auth/decorators/current-user.decorator");
const support_service_1 = require("./support.service");
let SupportTicketType = class SupportTicketType {
    id;
    ticketNumber;
    subject;
    status;
    priority;
    customerName;
    customerEmail;
    assignedTo;
    messageCount;
    lastMessage;
    createdAt;
    updatedAt;
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SupportTicketType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SupportTicketType.prototype, "ticketNumber", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SupportTicketType.prototype, "subject", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SupportTicketType.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SupportTicketType.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SupportTicketType.prototype, "customerName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SupportTicketType.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SupportTicketType.prototype, "assignedTo", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SupportTicketType.prototype, "messageCount", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SupportTicketType.prototype, "lastMessage", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SupportTicketType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SupportTicketType.prototype, "updatedAt", void 0);
SupportTicketType = __decorate([
    (0, graphql_1.ObjectType)()
], SupportTicketType);
let SupportMessageType = class SupportMessageType {
    id;
    ticketId;
    authorName;
    authorEmail;
    content;
    isStaff;
    isInternal;
    createdAt;
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SupportMessageType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SupportMessageType.prototype, "ticketId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SupportMessageType.prototype, "authorName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SupportMessageType.prototype, "authorEmail", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SupportMessageType.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], SupportMessageType.prototype, "isStaff", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], SupportMessageType.prototype, "isInternal", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SupportMessageType.prototype, "createdAt", void 0);
SupportMessageType = __decorate([
    (0, graphql_1.ObjectType)()
], SupportMessageType);
let SupportStatsType = class SupportStatsType {
    open;
    waiting;
    resolved;
    closed;
    urgent;
    total;
};
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SupportStatsType.prototype, "open", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SupportStatsType.prototype, "waiting", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SupportStatsType.prototype, "resolved", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SupportStatsType.prototype, "closed", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SupportStatsType.prototype, "urgent", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SupportStatsType.prototype, "total", void 0);
SupportStatsType = __decorate([
    (0, graphql_1.ObjectType)()
], SupportStatsType);
let CreateTicketInput = class CreateTicketInput {
    subject;
    customerName;
    customerEmail;
    message;
    priority;
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateTicketInput.prototype, "subject", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateTicketInput.prototype, "customerName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateTicketInput.prototype, "customerEmail", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateTicketInput.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreateTicketInput.prototype, "priority", void 0);
CreateTicketInput = __decorate([
    (0, graphql_1.InputType)()
], CreateTicketInput);
let UpdateTicketInput = class UpdateTicketInput {
    status;
    priority;
    assignedTo;
};
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateTicketInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateTicketInput.prototype, "priority", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateTicketInput.prototype, "assignedTo", void 0);
UpdateTicketInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateTicketInput);
let SupportResolver = class SupportResolver {
    supportService;
    constructor(supportService) {
        this.supportService = supportService;
    }
    async supportTickets(tenantId, status, priority) {
        const rows = await this.supportService.getTickets(tenantId, {
            status,
            priority,
        });
        return rows.map((r) => ({
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
    async supportStats(tenantId) {
        return this.supportService.getStats(tenantId);
    }
    async ticketMessages(ticketId, tenantId) {
        const ticket = await this.supportService.getTicket(tenantId, ticketId);
        if (!ticket)
            throw new Error('Ticket nicht gefunden');
        const rows = await this.supportService.getMessages(ticketId, true);
        return rows.map((r) => ({
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
    async updateSupportTicket(id, input, tenantId) {
        const r = await this.supportService.updateTicket(tenantId, id, input);
        return {
            id: r.id,
            ticketNumber: r.ticket_number,
            subject: r.subject,
            status: r.status,
            priority: r.priority,
            customerName: r.customer_name,
            customerEmail: r.customer_email,
            assignedTo: r.assigned_to,
            messageCount: 0,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
        };
    }
    async replyToTicket(ticketId, content, isInternal, tenantId, user) {
        const r = await this.supportService.addMessage(tenantId, ticketId, {
            authorName: 'Support',
            authorEmail: 'support@platform.com',
            content,
            isStaff: true,
            isInternal,
        });
        return {
            id: r.id,
            ticketId: r.ticket_id,
            authorName: r.author_name,
            authorEmail: r.author_email,
            content: r.content,
            isStaff: r.is_staff,
            isInternal: r.is_internal,
            createdAt: r.created_at,
        };
    }
    async deleteSupportTicket(id, tenantId) {
        return this.supportService.deleteTicket(tenantId, id);
    }
};
exports.SupportResolver = SupportResolver;
__decorate([
    (0, graphql_1.Query)(() => [SupportTicketType]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __param(1, (0, graphql_1.Args)('status', { nullable: true })),
    __param(2, (0, graphql_1.Args)('priority', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SupportResolver.prototype, "supportTickets", null);
__decorate([
    (0, graphql_1.Query)(() => SupportStatsType),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SupportResolver.prototype, "supportStats", null);
__decorate([
    (0, graphql_1.Query)(() => [SupportMessageType]),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('ticketId')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SupportResolver.prototype, "ticketMessages", null);
__decorate([
    (0, graphql_1.Mutation)(() => SupportTicketType),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTicketInput, String]),
    __metadata("design:returntype", Promise)
], SupportResolver.prototype, "updateSupportTicket", null);
__decorate([
    (0, graphql_1.Mutation)(() => SupportMessageType),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('ticketId')),
    __param(1, (0, graphql_1.Args)('content')),
    __param(2, (0, graphql_1.Args)('isInternal', { defaultValue: false })),
    __param(3, (0, tenant_id_decorator_1.TenantId)()),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Boolean, String, Object]),
    __metadata("design:returntype", Promise)
], SupportResolver.prototype, "replyToTicket", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, tenant_id_decorator_1.TenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SupportResolver.prototype, "deleteSupportTicket", null);
exports.SupportResolver = SupportResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [support_service_1.SupportService])
], SupportResolver);
//# sourceMappingURL=support.resolver.js.map