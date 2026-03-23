import type { DrizzleDB } from '../../../core/database/drizzle.module';
export interface SeoMetaInput {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
    noindex?: boolean;
    nofollow?: boolean;
}
export declare class SeoService {
    private db;
    constructor(db: DrizzleDB);
    getSeoMeta(entityType: string, entityId: string): Promise<{
        id: string;
        entityType: string;
        entityId: string;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        ogTitle: string | null;
        ogDescription: string | null;
        ogImage: string | null;
        canonicalUrl: string | null;
        noindex: boolean;
        nofollow: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    upsertSeoMeta(entityType: string, entityId: string, input: SeoMetaInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metaDescription: string | null;
        entityType: string;
        entityId: string;
        metaTitle: string | null;
        metaKeywords: string | null;
        ogTitle: string | null;
        ogDescription: string | null;
        ogImage: string | null;
        canonicalUrl: string | null;
        noindex: boolean;
        nofollow: boolean;
    }>;
    deleteSeoMeta(entityType: string, entityId: string): Promise<boolean>;
}
