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
exports.UpdateMediaInput = exports.MediaFile = void 0;
const graphql_1 = require("@nestjs/graphql");
let MediaFile = class MediaFile {
    id;
    filename;
    originalFilename;
    mimeType;
    fileSize;
    type;
    url;
    thumbnailUrl;
    alt;
    title;
    description;
    folder;
    tags;
    width;
    height;
    createdAt;
};
exports.MediaFile = MediaFile;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MediaFile.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MediaFile.prototype, "filename", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MediaFile.prototype, "originalFilename", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MediaFile.prototype, "mimeType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MediaFile.prototype, "fileSize", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MediaFile.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MediaFile.prototype, "url", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MediaFile.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MediaFile.prototype, "alt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MediaFile.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MediaFile.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MediaFile.prototype, "folder", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], MediaFile.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], MediaFile.prototype, "width", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], MediaFile.prototype, "height", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], MediaFile.prototype, "createdAt", void 0);
exports.MediaFile = MediaFile = __decorate([
    (0, graphql_1.ObjectType)()
], MediaFile);
let UpdateMediaInput = class UpdateMediaInput {
    alt;
    title;
    description;
    folder;
    tags;
};
exports.UpdateMediaInput = UpdateMediaInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMediaInput.prototype, "alt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMediaInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMediaInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdateMediaInput.prototype, "folder", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdateMediaInput.prototype, "tags", void 0);
exports.UpdateMediaInput = UpdateMediaInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateMediaInput);
//# sourceMappingURL=media.types.js.map