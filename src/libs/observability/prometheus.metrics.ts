import { Injectable } from '@nestjs/common';
import { Counter, Registry } from 'prom-client';

/**
 * Prometheus metrics service
 * Manages counters and metrics for observability
 */
@Injectable()
export class PrometheusService {
  private readonly registry: Registry;
  private readonly mensagensRequests: Counter<string>;

  constructor() {
    this.registry = new Registry();

    // Counter for mensagens endpoint requests with clinicId label
    this.mensagensRequests = new Counter({
      name: 'mensagens_requests_total',
      help: 'Total number of mensagens requests',
      labelNames: ['clinicId'],
      registers: [this.registry],
    });
  }

  /**
   * Increments messages requests counter
   * @param clinicId - Clinic ID to dimension the metric
   */
  incrementMensagensRequests(clinicId: string): void {
    // Sanitize clinicId to prevent cardinality explosion
    // Remove special characters, keep only alphanumeric, underscore and hyphen
    const sanitizedClinicId = clinicId.replace(/[^a-zA-Z0-9_-]/g, '_');
    this.mensagensRequests.inc({ clinicId: sanitizedClinicId });
  }

  /**
   * Returns all metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
