import { UserRole } from './auth.types';
export declare class UserListItem {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    isActive: boolean;
    emailVerified: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
}
export declare class UsersResponse {
    users: UserListItem[];
    total: number;
}
