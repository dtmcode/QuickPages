export declare class MediaFile {
    id: string;
    filename: string;
    originalFilename: string;
    mimeType: string;
    fileSize: number;
    type: string;
    url: string;
    thumbnailUrl?: string;
    alt?: string;
    title?: string;
    description?: string;
    folder?: string;
    tags: string[];
    width?: number;
    height?: number;
    createdAt: Date;
}
export declare class UpdateMediaInput {
    alt?: string;
    title?: string;
    description?: string;
    folder?: string;
    tags?: string[];
}
