export declare enum PageTemplate {
    default = "default",
    landing = "landing",
    contact = "contact",
    about = "about",
    blank = "blank"
}
export declare enum PageStatus {
    draft = "draft",
    published = "published",
    archived = "archived"
}
export declare class Page {
    id: string;
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
    metaDescription?: string;
    template: PageTemplate;
    status: PageStatus;
    isPublished: boolean;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class PagesResponse {
    pages: Page[];
    total: number;
}
export declare class CreatePageInput {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    metaDescription?: string;
    status?: PageStatus;
    template?: PageTemplate;
}
export declare class UpdatePageInput {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
    metaDescription?: string;
    status?: PageStatus;
    template?: PageTemplate;
}
