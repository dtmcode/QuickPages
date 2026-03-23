import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../../core/auth/guards/gql-auth.guard';
import { TenantId } from '../../../core/auth/decorators/tenant-id.decorator';
import { CurrentUser } from '../../../core/auth/decorators/current-user.decorator';
import type { JwtPayload } from '../../../core/auth/strategies/jwt.strategy';
import { MediaService } from '../services/media.service';
import { MediaFile, UpdateMediaInput } from '../dto/media.types';
import { GraphQLUpload } from 'graphql-upload-ts';
import type { FileUpload } from 'graphql-upload-ts';

@Resolver()
export class MediaResolver {
  constructor(private mediaService: MediaService) {}

  @Query(() => [MediaFile])
  @UseGuards(GqlAuthGuard)
  async mediaFiles(
    @TenantId() tenantId: string,
    @Args('type', { nullable: true }) type?: string,
    @Args('folder', { nullable: true }) folder?: string,
    @Args('search', { nullable: true }) search?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
  ) {
    return this.mediaService.getFiles(tenantId, {
      type,
      folder,
      search,
      limit,
      offset,
    });
  }

  @Query(() => MediaFile, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async mediaFile(@TenantId() tenantId: string, @Args('id') id: string) {
    return this.mediaService.getFile(tenantId, id);
  }

  @Query(() => [String])
  @UseGuards(GqlAuthGuard)
  async mediaFolders(@TenantId() tenantId: string) {
    return this.mediaService.getFolders(tenantId);
  }

  @Mutation(() => MediaFile)
  @UseGuards(GqlAuthGuard)
  async uploadMedia(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
    @Args('folder', { nullable: true }) folder?: string,
    @Args('alt', { nullable: true }) alt?: string,
    @Args('title', { nullable: true }) title?: string,
  ) {
    const { createReadStream, filename, mimetype } = await file;
    const stream = createReadStream();

    // Read stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return this.mediaService.uploadFile(tenantId, {
      filename: filename.replace(/[^a-zA-Z0-9.-]/g, '_'),
      originalFilename: filename,
      mimeType: mimetype,
      fileSize: buffer.length,
      buffer,
      folder,
      alt,
      title,
      userId: user.userId,
    });
  }

  @Mutation(() => MediaFile)
  @UseGuards(GqlAuthGuard)
  async updateMedia(
    @TenantId() tenantId: string,
    @Args('id') id: string,
    @Args('input') input: UpdateMediaInput,
  ) {
    return this.mediaService.updateFile(tenantId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteMedia(@TenantId() tenantId: string, @Args('id') id: string) {
    return this.mediaService.deleteFile(tenantId, id);
  }
}
