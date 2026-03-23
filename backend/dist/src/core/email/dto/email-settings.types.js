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
exports.TestEmailResult = exports.EmailSettingsInput = exports.EmailSettings = void 0;
const graphql_1 = require("@nestjs/graphql");
let EmailSettings = class EmailSettings {
    id;
    provider;
    smtpHost;
    smtpPort;
    smtpSecure;
    smtpUser;
    fromEmail;
    fromName;
    replyTo;
    isEnabled;
    isVerified;
    lastTestedAt;
};
exports.EmailSettings = EmailSettings;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmailSettings.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmailSettings.prototype, "provider", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmailSettings.prototype, "smtpHost", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], EmailSettings.prototype, "smtpPort", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], EmailSettings.prototype, "smtpSecure", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmailSettings.prototype, "smtpUser", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmailSettings.prototype, "fromEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmailSettings.prototype, "fromName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmailSettings.prototype, "replyTo", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], EmailSettings.prototype, "isEnabled", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], EmailSettings.prototype, "isVerified", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], EmailSettings.prototype, "lastTestedAt", void 0);
exports.EmailSettings = EmailSettings = __decorate([
    (0, graphql_1.ObjectType)()
], EmailSettings);
let EmailSettingsInput = class EmailSettingsInput {
    provider;
    smtpHost;
    smtpPort;
    smtpSecure;
    smtpUser;
    smtpPassword;
    fromEmail;
    fromName;
    replyTo;
};
exports.EmailSettingsInput = EmailSettingsInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmailSettingsInput.prototype, "provider", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmailSettingsInput.prototype, "smtpHost", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], EmailSettingsInput.prototype, "smtpPort", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], EmailSettingsInput.prototype, "smtpSecure", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmailSettingsInput.prototype, "smtpUser", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmailSettingsInput.prototype, "smtpPassword", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmailSettingsInput.prototype, "fromEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmailSettingsInput.prototype, "fromName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmailSettingsInput.prototype, "replyTo", void 0);
exports.EmailSettingsInput = EmailSettingsInput = __decorate([
    (0, graphql_1.InputType)()
], EmailSettingsInput);
let TestEmailResult = class TestEmailResult {
    success;
    error;
};
exports.TestEmailResult = TestEmailResult;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], TestEmailResult.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], TestEmailResult.prototype, "error", void 0);
exports.TestEmailResult = TestEmailResult = __decorate([
    (0, graphql_1.ObjectType)()
], TestEmailResult);
//# sourceMappingURL=email-settings.types.js.map