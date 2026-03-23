import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsEmail, Min } from 'class-validator';

@InputType()
export class OrderItemInput {
  @Field()
  @IsNotEmpty()
  productId: string;

  @Field()
  @IsNotEmpty()
  productName: string;

  @Field(() => Int)
  @Min(0)
  productPrice: number;

  @Field(() => Int)
  @Min(1)
  quantity: number;
}

@InputType()
export class CreateOrderInput {
  @Field()
  @IsEmail()
  customerEmail: string;

  @Field()
  @IsNotEmpty()
  customerName: string;

  @Field({ nullable: true })
  customerAddress?: string;

  @Field(() => [OrderItemInput])
  items: OrderItemInput[];

  @Field(() => Int)
  @Min(0)
  subtotal: number;

  @Field(() => Int, { defaultValue: 0 })
  tax: number;

  @Field(() => Int, { defaultValue: 0 })
  shipping: number;

  @Field(() => Int)
  @Min(0)
  total: number;

  @Field({ nullable: true })
  notes?: string;
}
