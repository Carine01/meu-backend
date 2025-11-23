import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';
import { PrometheusService } from '../../libs/observability/prometheus.metrics';

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductsRepository,
    PrometheusService,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
