import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});

@ObjectType()
export class OrderItem {
  @Field(() => ID)
  id: string;

  @Field()
  productName: string;

  @Field(() => Int)
  productPrice: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class Order {
  @Field(() => ID)
  id: string;

  @Field()
  orderNumber: string;

  @Field()
  customerEmail: string;

  @Field()
  customerName: string;

  @Field({ nullable: true })
  customerAddress?: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => Int)
  subtotal: number;

  @Field(() => Int)
  tax: number;

  @Field(() => Int)
  shipping: number;

  @Field(() => Int)
  total: number;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [OrderItem], { nullable: true })
  items?: OrderItem[];

  @Field()
  createdAt: Date;
}

@ObjectType()
export class OrdersResponse {
  @Field(() => [Order])
  orders: Order[];

  @Field(() => Int)
  total: number;
}
