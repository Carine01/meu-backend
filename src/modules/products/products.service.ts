import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { PrometheusService } from '../../libs/observability/prometheus.metrics';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    private readonly repo: ProductsRepository,
    private readonly prometheus: PrometheusService,
  ) {}

  async findAll(): Promise<Product[]> {
    this.prometheus.incrementProductRequests();
    return this.repo.findAll();
  }

  async create(product: Product): Promise<Product> {
    this.prometheus.incrementProductRequests();
    return this.repo.create(product);
  }
}
