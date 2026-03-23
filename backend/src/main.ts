// 📂 PFAD: backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { graphqlUploadExpress } from 'graphql-upload-ts';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS — Production-ready mit Wildcard-Subdomain Support
  const allowedOrigins = [
    // Lokal
    'http://localhost:3001',
    'http://localhost:3002',
    // LAN (optional)
    'http://192.168.178.148:3001',
    'http://192.168.178.148:3002',
    // Production (aus .env)
    process.env.FRONTEND_URL,
    process.env.PUBLIC_FRONTEND_URL,
  ].filter(Boolean) as string[];

  // Wildcard für *.deinedomain.de in Production
  const platformDomain = process.env.PLATFORM_DOMAIN; // z.B. 'quickpages.de'

  app.enableCors({
    origin: (origin, callback) => {
      // Kein Origin (z.B. mobile Apps, curl) — erlauben
      if (!origin) return callback(null, true);

      // Exakte Treffer
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Wildcard Subdomains in Production
      if (
        platformDomain &&
        (origin.endsWith(`.${platformDomain}`) ||
          origin === `https://${platformDomain}`)
      ) {
        return callback(null, true);
      }

      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  });

  // Cookie Parser
  app.use(cookieParser());

  // GraphQL Upload Middleware
  app.use(graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 10 }));

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Backend läuft auf http://localhost:${port}`);
  console.log(`📊 GraphQL: http://localhost:${port}/graphql`);
}

bootstrap();
