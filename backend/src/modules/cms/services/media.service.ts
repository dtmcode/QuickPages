import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../../../core/database/drizzle.module';
import type { DrizzleDB } from '../../../core/database/drizzle.module';
import { mediaFiles } from '../../../drizzle/schema';
import { eq, and, desc, like, inArray } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

export interface UploadFileInput {
  filename: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  buffer: Buffer;
  folder?: string;
  alt?: string;
  title?: string;
  userId?: string;
}

@Injectable()
export class MediaService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private getMediaType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document'))
      return 'document';
    return 'other';
  }

  async uploadFile(tenantId: string, input: UploadFileInput) {
    const mediaType = this.getMediaType(input.mimeType);
    const folder = input.folder || 'general';
    const uploadPath = path.join(this.uploadDir, tenantId, folder);

    // Create folder if not exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Save file
    const filename = `${Date.now()}-${input.filename}`;
    const filePath = path.join(uploadPath, filename);
    fs.writeFileSync(filePath, input.buffer);

    // Generate thumbnail for images
    let thumbnailUrl: string | null = null;
    let width: number | null = null;
    let height: number | null = null;

    if (mediaType === 'image') {
      try {
        const metadata = await sharp(filePath).metadata();
        width = metadata.width ?? null;
        height = metadata.height ?? null;

        // Create thumbnail
        const thumbFilename = `thumb-${filename}`;
        const thumbPath = path.join(uploadPath, thumbFilename);

        await sharp(filePath)
          .resize(300, 300, { fit: 'inside' })
          .toFile(thumbPath);

        thumbnailUrl = `/uploads/${tenantId}/${folder}/${thumbFilename}`;
      } catch (error) {
        console.error('Error generating thumbnail:', error);
      }
    }

    // Save to database
    const [file] = await this.db
      .insert(mediaFiles)
      .values({
        tenantId,
        filename,
        originalFilename: input.originalFilename,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        type: mediaType as any,
        url: `/uploads/${tenantId}/${folder}/${filename}`,
        thumbnailUrl,
        path: filePath,
        width,
        height,
        folder,
        alt: input.alt,
        title: input.title,
        uploadedBy: input.userId,
      })
      .returning();

    return file;
  }

  async getFiles(
    tenantId: string,
    options?: {
      type?: string;
      folder?: string;
      search?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const conditions = [eq(mediaFiles.tenantId, tenantId)];

    if (options?.type) {
      conditions.push(eq(mediaFiles.type, options.type as any));
    }

    if (options?.folder) {
      conditions.push(eq(mediaFiles.folder, options.folder));
    }

    if (options?.search) {
      conditions.push(like(mediaFiles.originalFilename, `%${options.search}%`));
    }

    const query = this.db
      .select()
      .from(mediaFiles)
      .where(and(...conditions))
      .orderBy(desc(mediaFiles.createdAt));

    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.offset) {
      query.offset(options.offset);
    }

    return query;
  }

  async getFile(tenantId: string, fileId: string) {
    const [file] = await this.db
      .select()
      .from(mediaFiles)
      .where(and(eq(mediaFiles.tenantId, tenantId), eq(mediaFiles.id, fileId)))
      .limit(1);

    return file;
  }

  async updateFile(
    tenantId: string,
    fileId: string,
    input: {
      alt?: string;
      title?: string;
      description?: string;
      folder?: string;
      tags?: string[];
    },
  ) {
    const [updated] = await this.db
      .update(mediaFiles)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(and(eq(mediaFiles.tenantId, tenantId), eq(mediaFiles.id, fileId)))
      .returning();

    return updated;
  }

  async deleteFile(tenantId: string, fileId: string) {
    const file = await this.getFile(tenantId, fileId);

    if (!file) {
      throw new Error('File not found');
    }

    // Delete physical file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete thumbnail
    if (file.thumbnailUrl) {
      const thumbPath = path.join(
        this.uploadDir,
        file.thumbnailUrl.replace('/uploads/', ''),
      );
      if (fs.existsSync(thumbPath)) {
        fs.unlinkSync(thumbPath);
      }
    }

    // Delete from database
    await this.db.delete(mediaFiles).where(eq(mediaFiles.id, fileId));

    return true;
  }

  async getFolders(tenantId: string) {
    const files = await this.db
      .select({ folder: mediaFiles.folder })
      .from(mediaFiles)
      .where(eq(mediaFiles.tenantId, tenantId));

    const folders = [...new Set(files.map((f) => f.folder).filter(Boolean))];
    return folders;
  }
}
