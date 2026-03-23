export declare enum OrderStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class OrderItem {
    id: string;
    productName: string;
    productPrice: number;
    quantity: number;
    total: number;
}
export declare class Order {
    id: string;
    orderNumber: string;
    customerEmail: string;
    customerName: string;
    customerAddress?: string;
    status: OrderStatus;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    notes?: string;
    items?: OrderItem[];
    createdAt: Date;
}
export declare class OrdersResponse {
    orders: Order[];
    total: number;
}
