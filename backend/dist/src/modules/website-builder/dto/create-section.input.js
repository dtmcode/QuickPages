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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSectionInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
const section_entity_1 = require("../entities/section.entity");
let CreateSectionInput = class CreateSectionInput {
    pageId;
    name;
    type;
    order;
    isActive;
    content;
    styling;
};
exports.CreateSectionInput = CreateSectionInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateSectionInput.prototype, "pageId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreateSectionInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => section_entity_1.SectionType),
    __metadata("design:type", String)
], CreateSectionInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CreateSectionInput.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Boolean)
], CreateSectionInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], CreateSectionInput.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], CreateSectionInput.prototype, "styling", void 0);
exports.CreateSectionInput = CreateSectionInput = __decorate([
    (0, graphql_1.InputType)()
], CreateSectionInput);
//# sourceMappingURL=create-section.input.js.map