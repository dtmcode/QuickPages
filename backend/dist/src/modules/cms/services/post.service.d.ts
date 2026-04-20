import type { DrizzleDB } from '../../../core/database/drizzle.module';
export interface CreatePostInput {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    metaDescription?: string;
    status?: string;
    categoryId?: string;
    tags?: string[];
    publishedAt?: string;
}
export interface UpdatePostInput {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
    metaDescription?: string;
    status?: string;
    categoryId?: string;
    tags?: string[];
    publishedAt?: string;
}
export declare class PostService {
    private db;
    constructor(db: DrizzleDB);
    createPost(tenantId: string, input: CreatePostInput): Promise<{
        id: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        slug: string;
        content: string | null;
        tenantId: string;
        title: string;
        isPublished: boolean;
        status: "draft" | "published" | "archived";
        authorId: string | null;
        excerpt: string | null;
        featuredImage: string | null;
        publishedAt: Date | null;
        categoryId: string | null;
    }>;
    getPosts(tenantId: string, options?: {
        status?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        id: string;
        tenantId: string;
        authorId: string | null;
        title: string;
        slug: string;
        content: string | null;
        excerpt: string | null;
        featuredImage: string | null;
        status: "draft" | "published" | "archived";
        isPublished: boolean;
        publishedAt: Date | null;
        categoryId: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
    getPost(tenantId: string, postId: string): Promise<{
        id: string;
        tenantId: string;
        authorId: string | null;
        title: string;
        slug: string;
        content: string | null;
        excerpt: string | null;
        featuredImage: string | null;
        status: "draft" | "published" | "archived";
        isPublished: boolean;
        publishedAt: Date | null;
        categoryId: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    updatePost(tenantId: string, postId: string, input: UpdatePostInput): Promise<{
        id: string;
        tenantId: string;
        authorId: string | null;
        title: string;
        slug: string;
        content: string | null;
        excerpt: string | null;
        featuredImage: string | null;
        status: "draft" | "published" | "archived";
        isPublished: boolean;
        publishedAt: Date | null;
        categoryId: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    deletePost(tenantId: string, postId: string): Promise<boolean>;
}
