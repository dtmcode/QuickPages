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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyDomainResponse = exports.AddDomainResponse = exports.DomainStatusResponse = exports.DnsInstructionType = void 0;
const graphql_1 = require("@nestjs/graphql");
let DnsInstructionType = class DnsInstructionType {
    type;
    name;
    value;
    purpose;
    required;
};
exports.DnsInstructionType = DnsInstructionType;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DnsInstructionType.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DnsInstructionType.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DnsInstructionType.prototype, "value", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DnsInstructionType.prototype, "purpose", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], DnsInstructionType.prototype, "required", void 0);
exports.DnsInstructionType = DnsInstructionType = __decorate([
    (0, graphql_1.ObjectType)()
], DnsInstructionType);
let DomainStatusResponse = class DomainStatusResponse {
    customDomain;
    verified;
    dnsValid;
    sslStatus;
    sslExpiresAt;
    verificationToken;
    dnsInstructions;
    lastDnsCheck;
};
exports.DomainStatusResponse = DomainStatusResponse;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], DomainStatusResponse.prototype, "customDomain", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], DomainStatusResponse.prototype, "verified", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], DomainStatusResponse.prototype, "dnsValid", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DomainStatusResponse.prototype, "sslStatus", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], DomainStatusResponse.prototype, "sslExpiresAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], DomainStatusResponse.prototype, "verificationToken", void 0);
__decorate([
    (0, graphql_1.Field)(() => [DnsInstructionType]),
    __metadata("design:type", Array)
], DomainStatusResponse.prototype, "dnsInstructions", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], DomainStatusResponse.prototype, "lastDnsCheck", void 0);
exports.DomainStatusResponse = DomainStatusResponse = __decorate([
    (0, graphql_1.ObjectType)()
], DomainStatusResponse);
let AddDomainResponse = class AddDomainResponse {
    domain;
    verificationToken;
    dnsInstructions;
};
exports.AddDomainResponse = AddDomainResponse;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AddDomainResponse.prototype, "domain", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AddDomainResponse.prototype, "verificationToken", void 0);
__decorate([
    (0, graphql_1.Field)(() => [DnsInstructionType]),
    __metadata("design:type", Array)
], AddDomainResponse.prototype, "dnsInstructions", void 0);
exports.AddDomainResponse = AddDomainResponse = __decorate([
    (0, graphql_1.ObjectType)()
], AddDomainResponse);
let VerifyDomainResponse = class VerifyDomainResponse {
    verified;
    txtValid;
    cnameValid;
    aValid;
    errors;
};
exports.VerifyDomainResponse = VerifyDomainResponse;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], VerifyDomainResponse.prototype, "verified", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], VerifyDomainResponse.prototype, "txtValid", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], VerifyDomainResponse.prototype, "cnameValid", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], VerifyDomainResponse.prototype, "aValid", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], VerifyDomainResponse.prototype, "errors", void 0);
exports.VerifyDomainResponse = VerifyDomainResponse = __decorate([
    (0, graphql_1.ObjectType)()
], VerifyDomainResponse);
//# sourceMappingURL=domain.types.js.map