import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { TenantId } from './decorators/tenant-id.decorator';
import { UsersResponse, UserListItem } from './dto/user.types';
import { DRIZZLE } from '../database/drizzle.module';
import type { DrizzleDB } from '../database/drizzle.module';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { UserRole } from './dto/auth.types';

@Resolver()
export class UserResolver {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  // ✅ Automatisch gefiltert nach Tenant!
  @Query(() => UsersResponse)
  @UseGuards(GqlAuthGuard)
  async users(@TenantId() tenantId: string): Promise<UsersResponse> {
    // Nur User des eigenen Tenants!
    const tenantUsers = await this.db
      .select()
      .from(users)
      .where(eq(users.tenantId, tenantId));

    return {
      users: tenantUsers.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        role: user.role as UserRole,
        isActive: user.isActive ?? true,
        emailVerified: user.emailVerified ?? false,
        lastLoginAt: user.lastLoginAt ?? undefined,
        createdAt: user.createdAt ?? new Date(),
      })),
      total: tenantUsers.length,
    };
  }
}
