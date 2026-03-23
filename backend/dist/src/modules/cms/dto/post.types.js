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
exports.UpdatePostInput = exports.CreatePostInput = exports.PostsResponse = exports.Post = exports.PostStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
var PostStatus;
(function (PostStatus) {
    PostStatus["draft"] = "draft";
    PostStatus["published"] = "published";
    PostStatus["archived"] = "archived";
})(PostStatus || (exports.PostStatus = PostStatus = {}));
(0, graphql_1.registerEnumType)(PostStatus, { name: 'PostStatus' });
let Post = class Post {
    id;
    title;
    slug;
    content;
    excerpt;
    featuredImage;
    metaDescription;
    status;
    isPublished;
    publishedAt;
    categoryId;
    tags;
    createdAt;
    updatedAt;
};
exports.Post = Post;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Post.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Post.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Post.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Post.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Post.prototype, "excerpt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Post.prototype, "featuredImage", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Post.prototype, "metaDescription", void 0);
__decorate([
    (0, graphql_1.Field)(() => PostStatus),
    __metadata("design:type", String)
], Post.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Post.prototype, "isPublished", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Post.prototype, "publishedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Post.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], Post.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Post.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Post.prototype, "updatedAt", void 0);
exports.Post = Post = __decorate([
    (0, graphql_1.ObjectType)()
], Post);
let PostsResponse = class PostsResponse {
    posts;
    total;
};
exports.PostsResponse = PostsResponse;
__decorate([
    (0, graphql_1.Field)(() => [Post]),
    __metadata("design:type", Array)
], PostsResponse.prototype, "posts", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], PostsResponse.prototype, "total", void 0);
exports.PostsResponse = PostsResponse = __decorate([
    (0, graphql_1.ObjectType)()
], PostsResponse);
let CreatePostInput = class CreatePostInput {
    title;
    slug;
    content;
    excerpt;
    featuredImage;
    metaDescription;
    status;
    categoryId;
    tags;
    publishedAt;
};
exports.CreatePostInput = CreatePostInput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreatePostInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreatePostInput.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CreatePostInput.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreatePostInput.prototype, "excerpt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreatePostInput.prototype, "featuredImage", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreatePostInput.prototype, "metaDescription", void 0);
__decorate([
    (0, graphql_1.Field)(() => PostStatus, { nullable: true }),
    __metadata("design:type", String)
], CreatePostInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreatePostInput.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CreatePostInput.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreatePostInput.prototype, "publishedAt", void 0);
exports.CreatePostInput = CreatePostInput = __decorate([
    (0, graphql_1.InputType)()
], CreatePostInput);
let UpdatePostInput = class UpdatePostInput {
    title;
    slug;
    content;
    excerpt;
    featuredImage;
    metaDescription;
    status;
    categoryId;
    tags;
    publishedAt;
};
exports.UpdatePostInput = UpdatePostInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdatePostInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdatePostInput.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdatePostInput.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdatePostInput.prototype, "excerpt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdatePostInput.prototype, "featuredImage", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdatePostInput.prototype, "metaDescription", void 0);
__decorate([
    (0, graphql_1.Field)(() => PostStatus, { nullable: true }),
    __metadata("design:type", String)
], UpdatePostInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdatePostInput.prototype, "categoryId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], UpdatePostInput.prototype, "tags", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], UpdatePostInput.prototype, "publishedAt", void 0);
exports.UpdatePostInput = UpdatePostInput = __decorate([
    (0, graphql_1.InputType)()
], UpdatePostInput);
//# sourceMappingURL=post.types.js.map