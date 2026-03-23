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
exports.NavigationItem = void 0;
const graphql_1 = require("@nestjs/graphql");
let NavigationItem = class NavigationItem {
    id;
    navigationId;
    label;
    type;
    url;
    pageId;
    postId;
    categoryId;
    icon;
    cssClass;
    openInNewTab;
    order;
    parentId;
    children;
    createdAt;
    updatedAt;
};
exports.NavigationItem = NavigationItem;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], NavigationItem.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NavigationItem.prototype, "navigationId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NavigationItem.prototype, "label", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], NavigationItem.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NavigationItem.prototype, "url", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NavigationItem.prototype, "pageId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NavigationItem.prototype, "postId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NavigationItem.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NavigationItem.prototype, "icon", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NavigationItem.prototype, "cssClass", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], NavigationItem.prototype, "openInNewTab", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], NavigationItem.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], NavigationItem.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [NavigationItem], { nullable: true }),
    __metadata("design:type", Array)
], NavigationItem.prototype, "children", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], NavigationItem.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], NavigationItem.prototype, "updatedAt", void 0);
exports.NavigationItem = NavigationItem = __decorate([
    (0, graphql_1.ObjectType)()
], NavigationItem);
//# sourceMappingURL=navigation-item.entity.js.map