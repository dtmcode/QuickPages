// backend\src\modules\courses\courses.module.ts

import { Module } from '@nestjs/common';
import { CoursesResolver } from './courses.resolver';
import { CoursesService } from './courses.service';
import { DrizzleModule } from '../../core/database/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [CoursesResolver, CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
