import { Counter } from 'prom-client';
import { Injectable } from '@nestjs/common';

const productRequests = new Counter({
  name: 'product_requests_total',
  help: 'Total de requisições em products',
});

@Injectable()
export class PrometheusService {
  incrementProductRequests() {
    productRequests.inc();
  }
}
