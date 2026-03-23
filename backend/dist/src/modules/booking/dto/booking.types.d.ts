export declare class BookingServiceType {
    id: string;
    name: string;
    slug: string;
    description?: string;
    durationMinutes: number;
    bufferMinutes: number;
    price: number;
    color: string;
    maxBookingsPerSlot: number;
    requiresConfirmation: boolean;
    isActive: boolean;
}
export declare class BookingAvailabilityType {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
}
export declare class BookingSlotType {
    startTime: string;
    endTime: string;
    available: boolean;
}
export declare class BookingDateType {
    date: string;
    available: boolean;
    slotsCount: number;
}
export declare class AppointmentType {
    id: string;
    serviceId: string;
    serviceName?: string;
    serviceColor?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerNotes?: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    cancellationReason?: string;
    createdAt: Date;
}
export declare class BookingSettingsType {
    timezone: string;
    minNoticeHours: number;
    maxAdvanceDays: number;
    slotIntervalMinutes: number;
    confirmationEmailEnabled: boolean;
    reminderEmailHours: number;
    cancellationPolicy?: string;
    bookingPageTitle?: string;
    bookingPageDescription?: string;
}
export declare class CreateBookingServiceInput {
    name: string;
    description?: string;
    durationMinutes: number;
    bufferMinutes: number;
    price: number;
    color: string;
    maxBookingsPerSlot: number;
    requiresConfirmation: boolean;
}
export declare class AvailabilitySlotInput {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
}
export declare class BookingSettingsInput {
    timezone?: string;
    minNoticeHours?: number;
    maxAdvanceDays?: number;
    slotIntervalMinutes?: number;
    confirmationEmailEnabled?: boolean;
    reminderEmailHours?: number;
    cancellationPolicy?: string;
    bookingPageTitle?: string;
    bookingPageDescription?: string;
}
