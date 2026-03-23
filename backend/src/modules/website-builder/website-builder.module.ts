/**
 * 🎨 WEBSITE BUILDER MODULE
 * NestJS Module für Website Builder
 */

import { Module } from '@nestjs/common';
import { WebsiteBuilderService } from './website-builder.service';
import { WebsiteBuilderResolver } from './website-builder.resolver';

@Module({
  providers: [WebsiteBuilderService, WebsiteBuilderResolver],
  exports: [WebsiteBuilderService],
})
export class WebsiteBuilderModule {}
