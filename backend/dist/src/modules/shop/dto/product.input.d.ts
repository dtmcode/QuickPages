export declare class CreateCategoryInput {
    name: string;
    description?: string;
    image?: string;
    isActive: boolean;
}
export declare class UpdateCategoryInput {
    name?: string;
    description?: string;
    image?: string;
    isActive?: boolean;
}
export declare class CreateProductInput {
    name: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    images?: string[];
    categoryId?: string;
    isActive: boolean;
    isFeatured: boolean;
}
export declare class UpdateProductInput {
    name?: string;
    description?: string;
    price?: number;
    compareAtPrice?: number;
    stock?: number;
    images?: string[];
    categoryId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
}
