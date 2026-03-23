import { Module } from '@nestjs/common';
import { FormBuilderService } from './form-builder.service';
import { FormBuilderResolver } from './form-builder.resolver';
import { FormBuilderPublicController } from './form-builder-public.controller';
import { EmailModule } from '../../core/email/email.module';
@Module({
  imports: [EmailModule],
  controllers: [FormBuilderPublicController],
  providers: [FormBuilderService, FormBuilderResolver],
  exports: [FormBuilderService],
})
export class FormBuilderModule {}
