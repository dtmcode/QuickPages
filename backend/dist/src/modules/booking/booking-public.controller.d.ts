import { BookingService } from './booking.service';
export declare class BookingPublicController {
    private bookingService;
    constructor(bookingService: BookingService);
    getServices(slug: string): Promise<any>;
    getSettings(slug: string): Promise<{
        title: any;
        description: any;
        cancellationPolicy: any;
        timezone: any;
    }>;
    getAvailableDates(slug: string, serviceId: string): Promise<{
        date: string;
        available: boolean;
        slotsCount: number;
    }[]>;
    getSlots(slug: string, serviceId: string, date: string): Promise<{
        startTime: string;
        endTime: string;
        available: boolean;
    }[]>;
    createBooking(slug: string, body: {
        serviceId: string;
        date: string;
        startTime: string;
        customerName: string;
        customerEmail: string;
        customerPhone?: string;
        customerNotes?: string;
    }): Promise<{
        success: boolean;
        appointment: any;
    }>;
    cancelByToken(token: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
