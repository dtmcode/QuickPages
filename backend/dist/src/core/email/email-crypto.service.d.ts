import { ConfigService } from '@nestjs/config';
export declare class EmailCryptoService {
    private configService;
    private algorithm;
    private encryptionKey;
    constructor(configService: ConfigService);
    encrypt(text: string): string;
    decrypt(encryptedText: string): string;
}
