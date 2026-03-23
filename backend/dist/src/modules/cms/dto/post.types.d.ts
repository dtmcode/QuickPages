export declare enum PostStatus {
    draft = "draft",
    published = "published",
    archived = "archived"
}
export declare class Post {
    id: string;
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
    metaDescription?: string;
    status: PostStatus;
    isPublished: boolean;
    publishedAt?: Date;
    categoryId?: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare class PostsResponse {
    posts: Post[];
    total: number;
}
export declare class CreatePostInput {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    metaDescription?: string;
    status?: PostStatus;
    categoryId?: string;
    tags?: string[];
    publishedAt?: string;
}
export declare class UpdatePostInput {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
    metaDescription?: string;
    status?: PostStatus;
    categoryId?: string;
    tags?: string[];
    publishedAt?: string;
}
