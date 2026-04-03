import type { DrizzleDB } from '../../core/database/drizzle.module';
import { JwtService } from '@nestjs/jwt';
export declare class CustomerAuthController {
    private db;
    private jwtService;
    constructor(db: DrizzleDB, jwtService: JwtService);
    private verifyToken;
    register(slug: string, body: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
    }): Promise<{
        accessToken: string;
        customer: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        };
    }>;
    login(slug: string, body: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: string;
        customer: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        };
    }>;
    me(auth: string): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
    }>;
    getOrders(auth: string): Promise<{
        id: string;
        tenantId: string;
        orderNumber: string;
        customerEmail: string;
        customerName: string;
        customerAddress: string | null;
        status: "cancelled" | "pending" | "processing" | "completed";
        subtotal: number;
        tax: number;
        shipping: number;
        total: number;
        notes: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
    updateProfile(auth: string, body: {
        firstName?: string;
        lastName?: string;
    }): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
    }>;
}
