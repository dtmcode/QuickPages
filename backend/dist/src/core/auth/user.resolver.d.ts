import { UsersResponse } from './dto/user.types';
import type { DrizzleDB } from '../database/drizzle.module';
export declare class UserResolver {
    private db;
    constructor(db: DrizzleDB);
    users(tenantId: string): Promise<UsersResponse>;
}
