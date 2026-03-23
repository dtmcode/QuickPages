import type { DrizzleDB } from '../../core/database/drizzle.module';
export declare class BookingService {
    private db;
    private readonly logger;
    constructor(db: DrizzleDB);
    getServices(tenantId: string): Promise<any>;
    getActiveServices(tenantId: string): Promise<any>;
    createService(tenantId: string, data: {
        name: string;
        description?: string;
        durationMinutes: number;
        bufferMinutes?: number;
        price?: number;
        color?: string;
        maxBookingsPerSlot?: number;
        requiresConfirmation?: boolean;
    }): Promise<any>;
    updateService(tenantId: string, serviceId: string, data: Record<string, any>): Promise<any>;
    deleteService(tenantId: string, serviceId: string): Promise<boolean>;
    getAvailability(tenantId: string): Promise<any>;
    setAvailability(tenantId: string, slots: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        isActive: boolean;
    }>): Promise<any>;
    getBlockedDates(tenantId: string): Promise<any>;
    addBlockedDate(tenantId: string, date: string, reason?: string): Promise<any>;
    removeBlockedDate(tenantId: string, blockedDateId: string): Promise<boolean>;
    getSettings(tenantId: string): Promise<any>;
    updateSettings(tenantId: string, data: Record<string, any>): Promise<any>;
    getAvailableSlots(tenantId: string, serviceId: string, date: string): Promise<Array<{
        startTime: string;
        endTime: string;
        available: boolean;
    }>>;
    getAvailableDates(tenantId: string, serviceId: string, days?: number): Promise<Array<{
        date: string;
        available: boolean;
        slotsCount: number;
    }>>;
    createAppointment(tenantId: string, data: {
        serviceId: string;
        date: string;
        startTime: string;
        customerName: string;
        customerEmail: string;
        customerPhone?: string;
        customerNotes?: string;
    }): Promise<any>;
    cancelAppointment(tenantId: string, appointmentId: string, reason?: string): Promise<any>;
    cancelByToken(token: string): Promise<any>;
    getAppointments(tenantId: string, filters?: {
        startDate?: string;
        endDate?: string;
        status?: string;
        serviceId?: string;
    }): Promise<any>;
    updateAppointmentStatus(tenantId: string, appointmentId: string, status: string): Promise<any>;
    getTenantIdBySlug(slug: string): Promise<string | null>;
    private timeToMinutes;
    private minutesToTime;
    private toSnakeCase;
}
