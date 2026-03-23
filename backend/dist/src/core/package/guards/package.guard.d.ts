import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { DrizzleDB } from '../../database/drizzle.module';
export declare class PackageGuard implements CanActivate {
    private reflector;
    private db;
    constructor(reflector: Reflector, db: DrizzleDB);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
