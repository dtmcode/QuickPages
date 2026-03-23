"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmsModule = void 0;
const common_1 = require("@nestjs/common");
const page_service_1 = require("./services/page.service");
const post_service_1 = require("./services/post.service");
const media_service_1 = require("./services/media.service");
const seo_service_1 = require("./services/seo.service");
const page_resolver_1 = require("./resolvers/page.resolver");
const post_resolver_1 = require("./resolvers/post.resolver");
const media_resolver_1 = require("./resolvers/media.resolver");
const seo_resolver_1 = require("./resolvers/seo.resolver");
let CmsModule = class CmsModule {
};
exports.CmsModule = CmsModule;
exports.CmsModule = CmsModule = __decorate([
    (0, common_1.Module)({
        providers: [
            page_service_1.PageService,
            post_service_1.PostService,
            media_service_1.MediaService,
            seo_service_1.SeoService,
            page_resolver_1.PageResolver,
            post_resolver_1.PostResolver,
            media_resolver_1.MediaResolver,
            seo_resolver_1.SeoResolver,
        ],
        exports: [page_service_1.PageService, post_service_1.PostService, media_service_1.MediaService, seo_service_1.SeoService],
    })
], CmsModule);
//# sourceMappingURL=cms.module.js.map