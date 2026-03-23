import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingResolver } from './booking.resolver';
import { BookingPublicController } from './booking-public.controller';

@Module({
  controllers: [BookingPublicController],
  providers: [BookingService, BookingResolver],
  exports: [BookingService],
})
export class BookingModule {}
