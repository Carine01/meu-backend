import { Injectable } from '@nestjs/common';
import { Product } from './product.entity';

// SOLID: Interface Segregation & Dependency Inversion
export interface IProductsRepository {
  findAll(): Promise<Product[]>;
  create(product: Product): Promise<Product>;
}

@Injectable()
export class ProductsRepository implements IProductsRepository {
  private products: Product[] = [];

  async findAll(): Promise<Product[]> {
    return this.products;
  }

  async create(product: Product): Promise<Product> {
    const newProduct = { ...product, id: Date.now().toString() };
    this.products.push(newProduct);
    return newProduct;
  }
}
