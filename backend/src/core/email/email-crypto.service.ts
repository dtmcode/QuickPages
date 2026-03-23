import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EmailCryptoService {
  private algorithm = 'aes-256-cbc';
  private encryptionKey: Buffer;

  constructor(private configService: ConfigService) {
    // Key aus .env (32 bytes für AES-256)
    const key = this.configService.get('EMAIL_ENCRYPTION_KEY');
    if (!key) {
      // Fallback für Development
      console.warn(
        '⚠️ EMAIL_ENCRYPTION_KEY not set, using default (INSECURE!)',
      );
      this.encryptionKey = Buffer.alloc(32, 0);
    } else {
      this.encryptionKey = Buffer.from(key, 'hex');
    }
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.algorithm,
      this.encryptionKey,
      iv,
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Format: iv:encrypted
    return `${iv.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.encryptionKey,
      iv,
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
