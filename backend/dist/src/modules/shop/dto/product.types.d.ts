export declare class Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    isActive: boolean;
    createdAt: Date;
}
export declare class Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    images?: string[];
    categoryId?: string;
    category?: Category;
    isActive: boolean;
    isFeatured: boolean;
    createdAt: Date;
}
export declare class ProductsResponse {
    products: Product[];
    total: number;
}
export declare class CategoriesResponse {
    categories: Category[];
    total: number;
}
