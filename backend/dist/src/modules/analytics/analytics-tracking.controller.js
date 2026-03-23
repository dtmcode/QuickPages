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
exports.AnalyticsTrackingController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
let AnalyticsTrackingController = class AnalyticsTrackingController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async trackPageView(tenantSlug, body, req) {
        const tenantId = await this.analyticsService.getTenantIdBySlug(tenantSlug);
        if (!tenantId) {
            return { ok: false };
        }
        await this.analyticsService.trackPageView({
            tenantId,
            path: body.path || '/',
            referrer: body.referrer || req.headers.referer,
            userAgent: req.headers['user-agent'],
            ip: this.getClientIp(req),
            sessionId: body.sessionId,
        });
        return { ok: true };
    }
    async updateDuration(tenantSlug, body) {
        if (!body.sessionId || !body.path || !body.duration) {
            return { ok: false };
        }
        await this.analyticsService.updateDuration(body.sessionId, body.path, Math.round(body.duration));
        return { ok: true };
    }
    async trackPixel(tenantSlug, req, res) {
        const tenantId = await this.analyticsService.getTenantIdBySlug(tenantSlug);
        if (tenantId) {
            this.analyticsService
                .trackPageView({
                tenantId,
                path: req.query.p || '/',
                referrer: req.headers.referer,
                userAgent: req.headers['user-agent'],
                ip: this.getClientIp(req),
            })
                .catch(() => { });
        }
        const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        res.status(common_1.HttpStatus.OK).end(pixel);
    }
    getClientIp(req) {
        const forwarded = req.headers['x-forwarded-for'];
        if (typeof forwarded === 'string') {
            return forwarded.split(',')[0].trim();
        }
        return req.ip || req.socket.remoteAddress || 'unknown';
    }
};
exports.AnalyticsTrackingController = AnalyticsTrackingController;
__decorate([
    (0, common_1.Post)(':tenant/track'),
    (0, common_1.Header)('Access-Control-Allow-Origin', '*'),
    (0, common_1.Header)('Cache-Control', 'no-store'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsTrackingController.prototype, "trackPageView", null);
__decorate([
    (0, common_1.Post)(':tenant/duration'),
    (0, common_1.Header)('Access-Control-Allow-Origin', '*'),
    (0, common_1.Header)('Cache-Control', 'no-store'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsTrackingController.prototype, "updateDuration", null);
__decorate([
    (0, common_1.Get)(':tenant/pixel'),
    (0, common_1.Header)('Cache-Control', 'no-store, no-cache, must-revalidate'),
    (0, common_1.Header)('Content-Type', 'image/gif'),
    __param(0, (0, common_1.Param)('tenant')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AnalyticsTrackingController.prototype, "trackPixel", null);
exports.AnalyticsTrackingController = AnalyticsTrackingController = __decorate([
    (0, common_1.Controller)('api/analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsTrackingController);
//# sourceMappingURL=analytics-tracking.controller.js.map