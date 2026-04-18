"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const graphql_upload_ts_1 = require("graphql-upload-ts");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { rawBody: true });
    const allowedOrigins = [
        'http://localhost:3001',
        'http://localhost:3002',
        'http://192.168.178.148:3001',
        'http://192.168.178.148:3002',
        process.env.FRONTEND_URL,
        process.env.PUBLIC_FRONTEND_URL,
    ].filter(Boolean);
    const platformDomain = process.env.PLATFORM_DOMAIN;
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin))
                return callback(null, true);
            if (platformDomain &&
                (origin.endsWith(`.${platformDomain}`) ||
                    origin === `https://${platformDomain}`)) {
                return callback(null, true);
            }
            callback(new Error(`CORS blocked: ${origin}`));
        },
        credentials: true,
    });
    app.use((0, cookie_parser_1.default)());
    app.use('/payments/webhook', require('express').raw({ type: 'application/json' }));
    app.use((0, graphql_upload_ts_1.graphqlUploadExpress)({ maxFileSize: 10_000_000, maxFiles: 10 }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: false,
        forbidNonWhitelisted: false,
        transform: true,
    }));
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`🚀 Backend läuft auf http://localhost:${port}`);
    console.log(`📊 GraphQL: http://localhost:${port}/graphql`);
}
bootstrap();
//# sourceMappingURL=main.js.map