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
exports.VerifyEmailInput = exports.ResetPasswordInput = exports.ForgotPasswordInput = exports.RefreshTokenInput = exports.LoginInput = exports.RegisterInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let RegisterInput = class RegisterInput {
    companyName;
    email;
    password;
    firstName;
    lastName;
};
exports.RegisterInput = RegisterInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Firmenname ist erforderlich' }),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], RegisterInput.prototype, "companyName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Ungültige E-Mail-Adresse' }),
    __metadata("design:type", String)
], RegisterInput.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.MinLength)(8, { message: 'Passwort muss mindestens 8 Zeichen haben' }),
    __metadata("design:type", String)
], RegisterInput.prototype, "password", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Vorname ist erforderlich' }),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], RegisterInput.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nachname ist erforderlich' }),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], RegisterInput.prototype, "lastName", void 0);
exports.RegisterInput = RegisterInput = __decorate([
    (0, graphql_1.InputType)()
], RegisterInput);
let LoginInput = class LoginInput {
    email;
    password;
};
exports.LoginInput = LoginInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Ungültige E-Mail-Adresse' }),
    __metadata("design:type", String)
], LoginInput.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.MinLength)(8, { message: 'Passwort muss mindestens 8 Zeichen haben' }),
    __metadata("design:type", String)
], LoginInput.prototype, "password", void 0);
exports.LoginInput = LoginInput = __decorate([
    (0, graphql_1.InputType)()
], LoginInput);
let RefreshTokenInput = class RefreshTokenInput {
    refreshToken;
};
exports.RefreshTokenInput = RefreshTokenInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Refresh Token ist erforderlich' }),
    __metadata("design:type", String)
], RefreshTokenInput.prototype, "refreshToken", void 0);
exports.RefreshTokenInput = RefreshTokenInput = __decorate([
    (0, graphql_1.InputType)()
], RefreshTokenInput);
let ForgotPasswordInput = class ForgotPasswordInput {
    email;
};
exports.ForgotPasswordInput = ForgotPasswordInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Ungültige E-Mail-Adresse' }),
    __metadata("design:type", String)
], ForgotPasswordInput.prototype, "email", void 0);
exports.ForgotPasswordInput = ForgotPasswordInput = __decorate([
    (0, graphql_1.InputType)()
], ForgotPasswordInput);
let ResetPasswordInput = class ResetPasswordInput {
    token;
    newPassword;
};
exports.ResetPasswordInput = ResetPasswordInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Token ist erforderlich' }),
    __metadata("design:type", String)
], ResetPasswordInput.prototype, "token", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.MinLength)(8, { message: 'Passwort muss mindestens 8 Zeichen haben' }),
    __metadata("design:type", String)
], ResetPasswordInput.prototype, "newPassword", void 0);
exports.ResetPasswordInput = ResetPasswordInput = __decorate([
    (0, graphql_1.InputType)()
], ResetPasswordInput);
let VerifyEmailInput = class VerifyEmailInput {
    token;
};
exports.VerifyEmailInput = VerifyEmailInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Token ist erforderlich' }),
    __metadata("design:type", String)
], VerifyEmailInput.prototype, "token", void 0);
exports.VerifyEmailInput = VerifyEmailInput = __decorate([
    (0, graphql_1.InputType)()
], VerifyEmailInput);
//# sourceMappingURL=auth.input.js.map