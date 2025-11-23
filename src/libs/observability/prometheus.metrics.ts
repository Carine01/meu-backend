import { Counter } from 'prom-client';
import { Injectable } from '@nestjs/common';

const productRequests = new Counter({
  name: 'product_requests_total',
  help: 'Total number of product requests',
});

@Injectable()
export class PrometheusService {
  incrementProductRequests() {
    productRequests.inc();
  }
}
