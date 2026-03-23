"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrizzleModule = exports.DRIZZLE = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const schema = __importStar(require("../../drizzle/schema"));
const wbSchema = __importStar(require("../../drizzle/website-builder.schema"));
exports.DRIZZLE = Symbol('DRIZZLE');
const fullSchema = { ...schema, ...wbSchema };
let DrizzleModule = class DrizzleModule {
};
exports.DrizzleModule = DrizzleModule;
exports.DrizzleModule = DrizzleModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: exports.DRIZZLE,
                inject: [config_1.ConfigService],
                useFactory: async (configService) => {
                    const databaseUrl = configService.get('DATABASE_URL');
                    const sslConfig = configService.get('DATABASE_SSL');
                    const useSSL = sslConfig === 'true';
                    console.log('🔌 Database Connection:');
                    console.log('   URL:', databaseUrl ? '✓ Set' : '✗ Missing');
                    console.log('   SSL:', useSSL ? 'enabled' : 'disabled');
                    let pool;
                    if (databaseUrl) {
                        pool = new pg_1.Pool({
                            connectionString: databaseUrl,
                            ssl: useSSL ? { rejectUnauthorized: false } : false,
                        });
                    }
                    else {
                        pool = new pg_1.Pool({
                            host: configService.get('DATABASE_HOST'),
                            port: configService.get('DATABASE_PORT'),
                            user: configService.get('DATABASE_USER'),
                            password: configService.get('DATABASE_PASSWORD'),
                            database: configService.get('DATABASE_NAME'),
                            ssl: useSSL ? { rejectUnauthorized: false } : false,
                        });
                    }
                    const db = (0, node_postgres_1.drizzle)(pool, {
                        schema: fullSchema,
                    });
                    return db;
                },
            },
        ],
        exports: [exports.DRIZZLE],
    })
], DrizzleModule);
//# sourceMappingURL=drizzle.module.js.map