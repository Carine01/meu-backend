import { Injectable } from '@nestjs/common';
import { Counter, Registry } from 'prom-client';

/**
 * Serviço de métricas Prometheus
 * Gerencia contadores e métricas para observabilidade
 */
@Injectable()
export class PrometheusService {
  private readonly registry: Registry;
  private readonly mensagensRequests: Counter;

  constructor() {
    this.registry = new Registry();

    // Contador de requisições ao endpoint de mensagens
    this.mensagensRequests = new Counter({
      name: 'mensagens_requests_total',
      help: 'Total de requisições em mensagens',
      registers: [this.registry],
    });
  }

  /**
   * Incrementa contador de requisições de mensagens
   */
  incrementMensagensRequests(): void {
    this.mensagensRequests.inc();
  }

  /**
   * Retorna todas as métricas em formato Prometheus
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
