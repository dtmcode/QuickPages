import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';

@ObjectType()
export class BookingServiceType {
  @Field() id: string;
  @Field() name: string;
  @Field() slug: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => Int) durationMinutes: number;
  @Field(() => Int) bufferMinutes: number;
  @Field(() => Int) price: number;
  @Field() color: string;
  @Field(() => Int) maxBookingsPerSlot: number;
  @Field() requiresConfirmation: boolean;
  @Field() isActive: boolean;
}

@ObjectType()
export class BookingAvailabilityType {
  @Field(() => Int) dayOfWeek: number;
  @Field() startTime: string;
  @Field() endTime: string;
  @Field() isActive: boolean;
}

@ObjectType()
export class BookingSlotType {
  @Field() startTime: string;
  @Field() endTime: string;
  @Field() available: boolean;
}

@ObjectType()
export class BookingDateType {
  @Field() date: string;
  @Field() available: boolean;
  @Field(() => Int) slotsCount: number;
}

@ObjectType()
export class AppointmentType {
  @Field() id: string;
  @Field() serviceId: string;
  @Field({ nullable: true }) serviceName?: string;
  @Field({ nullable: true }) serviceColor?: string;
  @Field() customerName: string;
  @Field() customerEmail: string;
  @Field({ nullable: true }) customerPhone?: string;
  @Field({ nullable: true }) customerNotes?: string;
  @Field() date: string;
  @Field() startTime: string;
  @Field() endTime: string;
  @Field() status: string;
  @Field({ nullable: true }) cancellationReason?: string;
  @Field() createdAt: Date;
}

@ObjectType()
export class BookingSettingsType {
  @Field() timezone: string;
  @Field(() => Int) minNoticeHours: number;
  @Field(() => Int) maxAdvanceDays: number;
  @Field(() => Int) slotIntervalMinutes: number;
  @Field() confirmationEmailEnabled: boolean;
  @Field(() => Int) reminderEmailHours: number;
  @Field({ nullable: true }) cancellationPolicy?: string;
  @Field({ nullable: true }) bookingPageTitle?: string;
  @Field({ nullable: true }) bookingPageDescription?: string;
}

@InputType()
export class CreateBookingServiceInput {
  @Field() name: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => Int) durationMinutes: number;
  @Field(() => Int, { defaultValue: 0 }) bufferMinutes: number;
  @Field(() => Int, { defaultValue: 0 }) price: number;
  @Field({ defaultValue: '#3b82f6' }) color: string;
  @Field(() => Int, { defaultValue: 1 }) maxBookingsPerSlot: number;
  @Field({ defaultValue: false }) requiresConfirmation: boolean;
}

@InputType()
export class AvailabilitySlotInput {
  @Field(() => Int) dayOfWeek: number;
  @Field() startTime: string;
  @Field() endTime: string;
  @Field() isActive: boolean;
}

@InputType()
export class BookingSettingsInput {
  @Field({ nullable: true }) timezone?: string;
  @Field(() => Int, { nullable: true }) minNoticeHours?: number;
  @Field(() => Int, { nullable: true }) maxAdvanceDays?: number;
  @Field(() => Int, { nullable: true }) slotIntervalMinutes?: number;
  @Field({ nullable: true }) confirmationEmailEnabled?: boolean;
  @Field(() => Int, { nullable: true }) reminderEmailHours?: number;
  @Field({ nullable: true }) cancellationPolicy?: string;
  @Field({ nullable: true }) bookingPageTitle?: string;
  @Field({ nullable: true }) bookingPageDescription?: string;
}
