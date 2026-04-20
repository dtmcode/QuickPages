import { SeoService } from '../services/seo.service';
import { SeoMetaInput } from '../dto/seo.types';
export declare class SeoResolver {
    private seoService;
    constructor(seoService: SeoService);
    seoMeta(entityType: string, entityId: string): Promise<{
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
    updateSeoMeta(entityType: string, entityId: string, input: SeoMetaInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        metaTitle: string | null;
        metaDescription: string | null;
        metaKeywords: string | null;
        entityType: string;
        entityId: string;
        ogTitle: string | null;
        ogDescription: string | null;
        ogImage: string | null;
        canonicalUrl: string | null;
        noindex: boolean;
        nofollow: boolean;
    }>;
}
