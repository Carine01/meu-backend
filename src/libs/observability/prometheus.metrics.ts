import { Injectable } from '@nestjs/common';
import { Counter, Registry } from 'prom-client';

/**
 * Serviço de métricas Prometheus
 * Gerencia contadores e métricas para observabilidade
 */
@Injectable()
export class PrometheusService {
  private readonly registry: Registry;
  private readonly mensagensRequests: Counter<string>;

  constructor() {
    this.registry = new Registry();

    // Contador de requisições ao endpoint de mensagens com label clinicId
    this.mensagensRequests = new Counter({
      name: 'mensagens_requests_total',
      help: 'Total number of mensagens requests',
      labelNames: ['clinicId'],
      registers: [this.registry],
    });
  }

  /**
   * Incrementa contador de requisições de mensagens
   * @param clinicId - ID da clínica para dimensionar a métrica
   */
  incrementMensagensRequests(clinicId: string): void {
    this.mensagensRequests.inc({ clinicId });
  }

  /**
   * Retorna todas as métricas em formato Prometheus
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
