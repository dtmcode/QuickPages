import { BookingService } from './booking.service';
import { BookingServiceType, CreateBookingServiceInput, AvailabilitySlotInput, BookingSettingsInput } from './dto/booking.types';
export declare class BookingResolver {
    private bookingService;
    constructor(bookingService: BookingService);
    bookingServices(tenantId: string): Promise<any>;
    createBookingService(input: CreateBookingServiceInput, tenantId: string): Promise<BookingServiceType>;
    deleteBookingService(id: string, tenantId: string): Promise<boolean>;
    bookingAvailability(tenantId: string): Promise<any>;
    setBookingAvailability(slots: AvailabilitySlotInput[], tenantId: string): Promise<any>;
    addBookingBlockedDate(date: string, reason: string, tenantId: string): Promise<boolean>;
    removeBookingBlockedDate(id: string, tenantId: string): Promise<boolean>;
    bookingAppointments(tenantId: string, startDate?: string, endDate?: string, status?: string): Promise<any>;
    cancelBookingAppointment(id: string, reason: string, tenantId: string): Promise<boolean>;
    updateAppointmentStatus(id: string, status: string, tenantId: string): Promise<boolean>;
    bookingSettings(tenantId: string): Promise<{
        timezone: any;
        minNoticeHours: any;
        maxAdvanceDays: any;
        slotIntervalMinutes: any;
        confirmationEmailEnabled: any;
        reminderEmailHours: any;
        cancellationPolicy: any;
        bookingPageTitle: any;
        bookingPageDescription: any;
    }>;
    updateBookingSettings(input: BookingSettingsInput, tenantId: string): Promise<boolean>;
    private mapService;
    private mapAppointment;
}
