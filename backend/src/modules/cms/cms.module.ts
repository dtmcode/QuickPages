import { Module } from '@nestjs/common';
import { PageService } from './services/page.service';
import { PostService } from './services/post.service';
import { MediaService } from './services/media.service';
import { SeoService } from './services/seo.service';
import { PageResolver } from './resolvers/page.resolver';
import { PostResolver } from './resolvers/post.resolver';
import { MediaResolver } from './resolvers/media.resolver';
import { SeoResolver } from './resolvers/seo.resolver';

@Module({
  providers: [
    PageService,
    PostService,
    MediaService,
    SeoService,
    PageResolver,
    PostResolver,
    MediaResolver,
    SeoResolver,
  ],
  exports: [PageService, PostService, MediaService, SeoService],
})
export class CmsModule {}
