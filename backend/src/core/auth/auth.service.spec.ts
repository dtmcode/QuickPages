// 📂 PFAD: backend/src/core/auth/auth.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { DRIZZLE } from '../database/drizzle.module';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

// Mock DB
const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  transaction: jest.fn(),
  innerJoin: jest.fn().mockReturnThis(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('http://localhost:3001'),
};

const mockEmailService = {
  sendPasswordReset: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid email', async () => {
      mockDb.limit.mockResolvedValue([]);

      await expect(
        service.login({ email: 'invalid@test.de', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should return success even for non-existent email', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await service.forgotPassword({ email: 'unknown@test.de' });

      expect(result.success).toBe(true);
      expect(result.message).toContain('Falls ein Account');
      // Email should NOT be sent for unknown users
      expect(mockEmailService.sendPasswordReset).not.toHaveBeenCalled();
    });

    it('should send reset email for existing user', async () => {
      mockDb.limit.mockResolvedValueOnce([
        {
          id: 'user-1',
          email: 'test@test.de',
          firstName: 'Max',
        },
      ]);
      // Mock the update (invalidate old tokens)
      mockDb.limit.mockResolvedValueOnce([]);
      // Mock the insert (new token)
      mockDb.returning.mockResolvedValueOnce([{ id: 'token-1' }]);

      const result = await service.forgotPassword({ email: 'test@test.de' });

      expect(result.success).toBe(true);
      expect(mockEmailService.sendPasswordReset).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@test.de',
          firstName: 'Max',
        }),
      );
    });
  });

  describe('resetPassword', () => {
    it('should throw for invalid token', async () => {
      mockDb.limit.mockResolvedValue([]);

      await expect(
        service.resetPassword({ token: 'invalid', newPassword: 'newpass123' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw for expired token', async () => {
      const expiredDate = new Date();
      expiredDate.setHours(expiredDate.getHours() - 2);

      mockDb.limit.mockResolvedValue([
        {
          id: 'token-1',
          userId: 'user-1',
          token: 'valid-token',
          expiresAt: expiredDate,
          used: false,
        },
      ]);

      await expect(
        service.resetPassword({
          token: 'valid-token',
          newPassword: 'newpass123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
