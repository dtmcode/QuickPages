import { Module } from '@nestjs/common';
import { RestaurantResolver } from './restaurant.resolver';
import { RestaurantService } from './restaurant.service';
import { DrizzleModule } from '../../core/database/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [RestaurantResolver, RestaurantService],
  exports: [RestaurantService],
})
export class RestaurantModule {}