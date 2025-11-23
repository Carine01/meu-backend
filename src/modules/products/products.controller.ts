import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  async getAll(): Promise<Product[]> {
    return this.service.findAll();
  }

  @Post()
  async create(@Body() product: Product): Promise<Product> {
    return this.service.create(product);
  }
}
