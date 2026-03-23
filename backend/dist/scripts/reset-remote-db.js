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
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function resetRemoteDatabase() {
    console.log('🔗 Verbinde mit Remote-Datenbank...');
    const pool = new pg_1.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });
    try {
        console.log('🔍 Liste alle Tabellen auf...');
        const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
        console.log('Gefundene Tabellen:', tablesResult.rows.map(r => r.tablename));
        console.log('');
        console.log('🗑️  Droppe ALLE Tabellen...');
        for (const row of tablesResult.rows) {
            await pool.query(`DROP TABLE IF EXISTS "${row.tablename}" CASCADE`);
            console.log(`  ✓ ${row.tablename}`);
        }
        console.log('');
        console.log('🗑️  Droppe ALLE Enums...');
        const enumsResult = await pool.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e'
    `);
        for (const row of enumsResult.rows) {
            await pool.query(`DROP TYPE IF EXISTS "${row.typname}" CASCADE`);
            console.log(`  ✓ ${row.typname}`);
        }
        console.log('');
        console.log('✅ Datenbank ist jetzt komplett leer!');
        console.log('');
        console.log('👉 Nächster Schritt: npm run db:push');
    }
    catch (error) {
        console.error('❌ Fehler beim Reset:', error.message);
        process.exit(1);
    }
    finally {
        await pool.end();
    }
}
resetRemoteDatabase();
//# sourceMappingURL=reset-remote-db.js.map