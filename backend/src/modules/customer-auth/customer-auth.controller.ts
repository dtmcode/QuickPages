// 📂 backend/src/modules/customer-auth/customer-auth.controller.ts

import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Headers,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { DRIZZLE } from '../../core/database/drizzle.module';
import type { DrizzleDB } from '../../core/database/drizzle.module';
import { tenantCustomers, tenants, orders } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Controller('api/public/:tenant')
export class CustomerAuthController {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private jwtService: JwtService,
  ) {}

  // ==================== HELPER ====================

  // Zeile 33 — verifyToken Rückgabetyp explizit angeben:

  private verifyToken(auth: string): { customerId: string; tenantId: string } {
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException();
    try {
      const payload = this.jwtService.verify<{
        customerId: string;
        tenantId: string;
      }>(auth.split(' ')[1]);
      return payload; // ← kein `as any`
    } catch {
      throw new UnauthorizedException();
    }
  }

  // ==================== AUTH ====================

  @Post('auth/register')
  async register(
    @Param('tenant') slug: string,
    @Body()
    body: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    },
  ) {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(and(eq(tenants.slug, slug), eq(tenants.isActive, true)))
      .limit(1);
    if (!tenant) throw new UnauthorizedException('Tenant nicht gefunden');

    const existing = await this.db
      .select()
      .from(tenantCustomers)
      .where(
        and(
          eq(tenantCustomers.tenantId, tenant.id),
          eq(tenantCustomers.email, body.email),
        ),
      )
      .limit(1);
    if (existing.length > 0)
      throw new UnauthorizedException('E-Mail bereits registriert');

    const passwordHash = await bcrypt.hash(body.password, 10);
    const [customer] = await this.db
      .insert(tenantCustomers)
      .values({
        tenantId: tenant.id,
        email: body.email,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        isActive: true,
      })
      .returning();

    const accessToken = this.jwtService.sign(
      { customerId: customer.id, tenantId: tenant.id, type: 'customer' },
      { expiresIn: '7d' },
    );

    return {
      accessToken,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    };
  }

  @Post('auth/login')
  async login(
    @Param('tenant') slug: string,
    @Body() body: { email: string; password: string },
  ) {
    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(and(eq(tenants.slug, slug), eq(tenants.isActive, true)))
      .limit(1);
    if (!tenant) throw new UnauthorizedException('Tenant nicht gefunden');

    const [customer] = await this.db
      .select()
      .from(tenantCustomers)
      .where(
        and(
          eq(tenantCustomers.tenantId, tenant.id),
          eq(tenantCustomers.email, body.email),
          eq(tenantCustomers.isActive, true),
        ),
      )
      .limit(1);
    if (!customer) throw new UnauthorizedException('Ungültige Anmeldedaten');

    const valid = await bcrypt.compare(body.password, customer.passwordHash!);
    if (!valid) throw new UnauthorizedException('Ungültige Anmeldedaten');

    const accessToken = this.jwtService.sign(
      { customerId: customer.id, tenantId: tenant.id, type: 'customer' },
      { expiresIn: '7d' },
    );

    return {
      accessToken,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    };
  }

  @Get('auth/me')
  async me(@Headers('authorization') auth: string) {
    const payload = this.verifyToken(auth);
    const [customer] = await this.db
      .select()
      .from(tenantCustomers)
      .where(eq(tenantCustomers.id, payload.customerId))
      .limit(1);
    if (!customer) throw new UnauthorizedException();
    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
    };
  }

  // ==================== ACCOUNT ====================

  @Get('account/orders')
  async getOrders(@Headers('authorization') auth: string) {
    const payload = this.verifyToken(auth);

    const [customer] = await this.db
      .select()
      .from(tenantCustomers)
      .where(eq(tenantCustomers.id, payload.customerId))
      .limit(1);
    if (!customer) throw new UnauthorizedException();

    return this.db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.tenantId, payload.tenantId),
          eq(orders.customerEmail, customer.email),
        ),
      )
      .orderBy(desc(orders.createdAt));
  }

  @Put('account/profile')
  async updateProfile(
    @Headers('authorization') auth: string,
    @Body() body: { firstName?: string; lastName?: string },
  ) {
    const payload = this.verifyToken(auth);

    await this.db
      .update(tenantCustomers)
      .set({
        firstName: body.firstName,
        lastName: body.lastName,
        updatedAt: new Date(),
      })
      .where(eq(tenantCustomers.id, payload.customerId));

    const [customer] = await this.db
      .select()
      .from(tenantCustomers)
      .where(eq(tenantCustomers.id, payload.customerId))
      .limit(1);

    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
    };
  }
}
