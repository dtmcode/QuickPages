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
exports.AnalyticsDashboardData = exports.AnalyticsBreakdowns = exports.BreakdownEntry = exports.TopReferrerEntry = exports.TopPageEntry = exports.AnalyticsDailyPoint = exports.AnalyticsOverview = void 0;
const graphql_1 = require("@nestjs/graphql");
let AnalyticsOverview = class AnalyticsOverview {
    totalPageViews;
    uniqueVisitors;
    totalSessions;
    avgDuration;
    bounceRate;
    ordersCount;
    revenue;
};
exports.AnalyticsOverview = AnalyticsOverview;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AnalyticsOverview.prototype, "totalPageViews", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AnalyticsOverview.prototype, "uniqueVisitors", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AnalyticsOverview.prototype, "totalSessions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AnalyticsOverview.prototype, "avgDuration", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AnalyticsOverview.prototype, "bounceRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AnalyticsOverview.prototype, "ordersCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AnalyticsOverview.prototype, "revenue", void 0);
exports.AnalyticsOverview = AnalyticsOverview = __decorate([
    (0, graphql_1.ObjectType)()
], AnalyticsOverview);
let AnalyticsDailyPoint = class AnalyticsDailyPoint {
    date;
    pageViews;
    uniqueVisitors;
    sessions;
    revenue;
};
exports.AnalyticsDailyPoint = AnalyticsDailyPoint;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AnalyticsDailyPoint.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AnalyticsDailyPoint.prototype, "pageViews", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AnalyticsDailyPoint.prototype, "uniqueVisitors", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AnalyticsDailyPoint.prototype, "sessions", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AnalyticsDailyPoint.prototype, "revenue", void 0);
exports.AnalyticsDailyPoint = AnalyticsDailyPoint = __decorate([
    (0, graphql_1.ObjectType)()
], AnalyticsDailyPoint);
let TopPageEntry = class TopPageEntry {
    path;
    views;
    uniqueViews;
};
exports.TopPageEntry = TopPageEntry;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TopPageEntry.prototype, "path", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], TopPageEntry.prototype, "views", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], TopPageEntry.prototype, "uniqueViews", void 0);
exports.TopPageEntry = TopPageEntry = __decorate([
    (0, graphql_1.ObjectType)()
], TopPageEntry);
let TopReferrerEntry = class TopReferrerEntry {
    referrer;
    visits;
};
exports.TopReferrerEntry = TopReferrerEntry;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TopReferrerEntry.prototype, "referrer", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], TopReferrerEntry.prototype, "visits", void 0);
exports.TopReferrerEntry = TopReferrerEntry = __decorate([
    (0, graphql_1.ObjectType)()
], TopReferrerEntry);
let BreakdownEntry = class BreakdownEntry {
    name;
    count;
};
exports.BreakdownEntry = BreakdownEntry;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], BreakdownEntry.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BreakdownEntry.prototype, "count", void 0);
exports.BreakdownEntry = BreakdownEntry = __decorate([
    (0, graphql_1.ObjectType)()
], BreakdownEntry);
let AnalyticsBreakdowns = class AnalyticsBreakdowns {
    devices;
    browsers;
    countries;
};
exports.AnalyticsBreakdowns = AnalyticsBreakdowns;
__decorate([
    (0, graphql_1.Field)(() => [BreakdownEntry]),
    __metadata("design:type", Array)
], AnalyticsBreakdowns.prototype, "devices", void 0);
__decorate([
    (0, graphql_1.Field)(() => [BreakdownEntry]),
    __metadata("design:type", Array)
], AnalyticsBreakdowns.prototype, "browsers", void 0);
__decorate([
    (0, graphql_1.Field)(() => [BreakdownEntry]),
    __metadata("design:type", Array)
], AnalyticsBreakdowns.prototype, "countries", void 0);
exports.AnalyticsBreakdowns = AnalyticsBreakdowns = __decorate([
    (0, graphql_1.ObjectType)()
], AnalyticsBreakdowns);
let AnalyticsDashboardData = class AnalyticsDashboardData {
    overview;
    dailyStats;
    topPages;
    topReferrers;
    breakdowns;
    realtimeVisitors;
};
exports.AnalyticsDashboardData = AnalyticsDashboardData;
__decorate([
    (0, graphql_1.Field)(() => AnalyticsOverview),
    __metadata("design:type", AnalyticsOverview)
], AnalyticsDashboardData.prototype, "overview", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AnalyticsDailyPoint]),
    __metadata("design:type", Array)
], AnalyticsDashboardData.prototype, "dailyStats", void 0);
__decorate([
    (0, graphql_1.Field)(() => [TopPageEntry]),
    __metadata("design:type", Array)
], AnalyticsDashboardData.prototype, "topPages", void 0);
__decorate([
    (0, graphql_1.Field)(() => [TopReferrerEntry]),
    __metadata("design:type", Array)
], AnalyticsDashboardData.prototype, "topReferrers", void 0);
__decorate([
    (0, graphql_1.Field)(() => AnalyticsBreakdowns),
    __metadata("design:type", AnalyticsBreakdowns)
], AnalyticsDashboardData.prototype, "breakdowns", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AnalyticsDashboardData.prototype, "realtimeVisitors", void 0);
exports.AnalyticsDashboardData = AnalyticsDashboardData = __decorate([
    (0, graphql_1.ObjectType)()
], AnalyticsDashboardData);
//# sourceMappingURL=analytics.types.js.map