"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantId = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
exports.TenantId = (0, common_1.createParamDecorator)((data, context) => {
    const ctx = graphql_1.GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;
    if (!user || !user.tenantId) {
        throw new Error('Tenant ID nicht gefunden');
    }
    return user.tenantId;
});
//# sourceMappingURL=tenant-id.decorator.js.map