import { Product, ProductsResponse, Category, CategoriesResponse } from './dto/product.types';
import { Order, OrdersResponse, OrderStatus } from './dto/order.types';
import { CreateProductInput, UpdateProductInput, CreateCategoryInput, UpdateCategoryInput } from './dto/product.input';
import { CreateOrderInput } from './dto/order.input';
import type { DrizzleDB } from '../../core/database/drizzle.module';
export declare class ShopResolver {
    private db;
    constructor(db: DrizzleDB);
    categories(tenantId: string): Promise<CategoriesResponse>;
    publicCategories(): Promise<Category[]>;
    createCategory(input: CreateCategoryInput, tenantId: string): Promise<Category>;
    updateCategory(id: string, input: UpdateCategoryInput, tenantId: string): Promise<Category>;
    deleteCategory(id: string, tenantId: string): Promise<boolean>;
    products(tenantId: string): Promise<ProductsResponse>;
    publicProducts(): Promise<Product[]>;
    createProduct(input: CreateProductInput, tenantId: string): Promise<Product>;
    updateProduct(id: string, input: UpdateProductInput, tenantId: string): Promise<Product>;
    deleteProduct(id: string, tenantId: string): Promise<boolean>;
    orders(tenantId: string): Promise<OrdersResponse>;
    order(id: string, tenantId: string): Promise<Order>;
    createOrder(input: CreateOrderInput, tenantId: string): Promise<Order>;
    updateOrderStatus(id: string, status: OrderStatus, tenantId: string): Promise<Order>;
}
