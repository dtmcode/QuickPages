"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_module_1 = require("../../../core/database/drizzle.module");
const schema_1 = require("../../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sharp_1 = __importDefault(require("sharp"));
let MediaService = class MediaService {
    db;
    uploadDir = path.join(process.cwd(), 'uploads');
    constructor(db) {
        this.db = db;
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    getMediaType(mimeType) {
        if (mimeType.startsWith('image/'))
            return 'image';
        if (mimeType.startsWith('video/'))
            return 'video';
        if (mimeType.startsWith('audio/'))
            return 'audio';
        if (mimeType.includes('pdf') || mimeType.includes('document'))
            return 'document';
        return 'other';
    }
    async uploadFile(tenantId, input) {
        const mediaType = this.getMediaType(input.mimeType);
        const folder = input.folder || 'general';
        const uploadPath = path.join(this.uploadDir, tenantId, folder);
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        const filename = `${Date.now()}-${input.filename}`;
        const filePath = path.join(uploadPath, filename);
        fs.writeFileSync(filePath, input.buffer);
        let thumbnailUrl = null;
        let width = null;
        let height = null;
        if (mediaType === 'image') {
            try {
                const metadata = await (0, sharp_1.default)(filePath).metadata();
                width = metadata.width ?? null;
                height = metadata.height ?? null;
                const thumbFilename = `thumb-${filename}`;
                const thumbPath = path.join(uploadPath, thumbFilename);
                await (0, sharp_1.default)(filePath)
                    .resize(300, 300, { fit: 'inside' })
                    .toFile(thumbPath);
                thumbnailUrl = `/uploads/${tenantId}/${folder}/${thumbFilename}`;
            }
            catch (error) {
                console.error('Error generating thumbnail:', error);
            }
        }
        const [file] = await this.db
            .insert(schema_1.mediaFiles)
            .values({
            tenantId,
            filename,
            originalFilename: input.originalFilename,
            mimeType: input.mimeType,
            fileSize: input.fileSize,
            type: mediaType,
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
    async getFiles(tenantId, options) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.mediaFiles.tenantId, tenantId)];
        if (options?.type) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.mediaFiles.type, options.type));
        }
        if (options?.folder) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.mediaFiles.folder, options.folder));
        }
        if (options?.search) {
            conditions.push((0, drizzle_orm_1.like)(schema_1.mediaFiles.originalFilename, `%${options.search}%`));
        }
        const query = this.db
            .select()
            .from(schema_1.mediaFiles)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.mediaFiles.createdAt));
        if (options?.limit) {
            query.limit(options.limit);
        }
        if (options?.offset) {
            query.offset(options.offset);
        }
        return query;
    }
    async getFile(tenantId, fileId) {
        const [file] = await this.db
            .select()
            .from(schema_1.mediaFiles)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.mediaFiles.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.mediaFiles.id, fileId)))
            .limit(1);
        return file;
    }
    async updateFile(tenantId, fileId, input) {
        const [updated] = await this.db
            .update(schema_1.mediaFiles)
            .set({
            ...input,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.mediaFiles.tenantId, tenantId), (0, drizzle_orm_1.eq)(schema_1.mediaFiles.id, fileId)))
            .returning();
        return updated;
    }
    async deleteFile(tenantId, fileId) {
        const file = await this.getFile(tenantId, fileId);
        if (!file) {
            throw new Error('File not found');
        }
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        if (file.thumbnailUrl) {
            const thumbPath = path.join(this.uploadDir, file.thumbnailUrl.replace('/uploads/', ''));
            if (fs.existsSync(thumbPath)) {
                fs.unlinkSync(thumbPath);
            }
        }
        await this.db.delete(schema_1.mediaFiles).where((0, drizzle_orm_1.eq)(schema_1.mediaFiles.id, fileId));
        return true;
    }
    async getFolders(tenantId) {
        const files = await this.db
            .select({ folder: schema_1.mediaFiles.folder })
            .from(schema_1.mediaFiles)
            .where((0, drizzle_orm_1.eq)(schema_1.mediaFiles.tenantId, tenantId));
        const folders = [...new Set(files.map((f) => f.folder).filter(Boolean))];
        return folders;
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], MediaService);
//# sourceMappingURL=media.service.js.map