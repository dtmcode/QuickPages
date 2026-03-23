/**
 * DRIZZLE MODULE
 * Lädt BEIDE Schemas: Core + Website Builder
 */

import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// ✅ BEIDE Schemas importieren
import * as schema from '../../drizzle/schema';
import * as wbSchema from '../../drizzle/website-builder.schema';

export const DRIZZLE = Symbol('DRIZZLE');

const fullSchema = { ...schema, ...wbSchema };
export type DrizzleDB = NodePgDatabase<typeof fullSchema>;

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        // ✅ DATABASE_URL aus .env lesen
        const databaseUrl = configService.get<string>('DATABASE_URL');

        // ✅ SSL richtig prüfen (String "true" vs "false")
        const sslConfig = configService.get<string>('DATABASE_SSL');
        const useSSL = sslConfig === 'true';

        console.log('🔌 Database Connection:');
        console.log('   URL:', databaseUrl ? '✓ Set' : '✗ Missing');
        console.log('   SSL:', useSSL ? 'enabled' : 'disabled');

        let pool: Pool;

        if (databaseUrl) {
          // ✅ Connection String (aus .env)
          pool = new Pool({
            connectionString: databaseUrl,
            ssl: useSSL ? { rejectUnauthorized: false } : false,
          });
        } else {
          // ✅ Fallback: Einzelne Variablen
          pool = new Pool({
            host: configService.get<string>('DATABASE_HOST'),
            port: configService.get<number>('DATABASE_PORT'),
            user: configService.get<string>('DATABASE_USER'),
            password: configService.get<string>('DATABASE_PASSWORD'),
            database: configService.get<string>('DATABASE_NAME'),
            ssl: useSSL ? { rejectUnauthorized: false } : false,
          });
        }

        // ✅ BEIDE Schemas mergen!
        const db = drizzle(pool, {
          schema: fullSchema,
        }) as DrizzleDB;

        return db;
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
