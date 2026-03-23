export declare class OrderItemInput {
    productId: string;
    productName: string;
    productPrice: number;
    quantity: number;
}
export declare class CreateOrderInput {
    customerEmail: string;
    customerName: string;
    customerAddress?: string;
    items: OrderItemInput[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    notes?: string;
}
