import { PostService } from '../services/post.service';
import { CreatePostInput, UpdatePostInput } from '../dto/post.types';
export declare class PostResolver {
    private postService;
    constructor(postService: PostService);
    posts(tenantId: string, status?: string, search?: string, limit?: number, offset?: number): Promise<{
        posts: {
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
        }[];
        total: number;
    }>;
    post(tenantId: string, id: string): Promise<{
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
    createPost(tenantId: string, input: CreatePostInput): Promise<{
        id: string;
        slug: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        tenantId: string;
        status: "draft" | "published" | "archived";
        authorId: string | null;
        title: string;
        content: string | null;
        excerpt: string | null;
        featuredImage: string | null;
        isPublished: boolean;
        publishedAt: Date | null;
        categoryId: string | null;
    }>;
    updatePost(tenantId: string, id: string, input: UpdatePostInput): Promise<{
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
    deletePost(tenantId: string, id: string): Promise<boolean>;
}
