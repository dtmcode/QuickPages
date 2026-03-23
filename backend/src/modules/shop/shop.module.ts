import { Module } from '@nestjs/common';
import { ShopResolver } from './shop.resolver';

@Module({
  providers: [ShopResolver],
})
export class ShopModule {}
