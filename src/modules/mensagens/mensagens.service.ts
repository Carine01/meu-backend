import { Injectable, Inject } from '@nestjs/common';
import { PrometheusService } from '../../libs/observability/prometheus.metrics';

/**
 * Interface for Mensagem entity
 */
export interface Mensagem {
  id: number | string;
  clinicId: string;
  texto: string;
  destinatario?: string;
  status?: string;
  createdAt?: Date;
}

/**
 * Repository interface - SOLID: Interface Segregation & Dependency Inversion
 */
export interface IMensagensRepository {
  findAllByClinic(clinicId: string): Promise<Mensagem[]>;
  // outros métodos...
}

/**
 * Messages Service with multitenancy support
 * Filters messages by clinicId to ensure data isolation
 */
@Injectable()
export class MensagensService {
  constructor(
    @Inject('IMensagensRepository')
    private readonly repo: IMensagensRepository,
    private readonly prometheus: PrometheusService,
  ) {}

  /**
   * Retrieves all messages for a specific clinic
   * Ensures data isolation through clinicId
   * 
   * @param clinicId - Clinic ID
   * @returns Array of messages filtered by clinicId
   */
  async findAllByClinic(clinicId: string): Promise<Mensagem[]> {
    this.prometheus.incrementMensagensRequests(clinicId);
    return this.repo.findAllByClinic(clinicId);
  }
}
