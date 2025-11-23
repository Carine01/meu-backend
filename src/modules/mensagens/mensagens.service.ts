import { Injectable, Inject } from '@nestjs/common';
import { PrometheusService } from '../../libs/observability/prometheus.metrics';

/**
 * Interface para entidade Mensagem
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
 * Interface para Repository - SOLID: Interface Segregation & Dependency Inversion
 */
export interface IMensagensRepository {
  findAllByClinic(clinicId: string): Promise<Mensagem[]>;
  // outros métodos...
}

/**
 * Service de Mensagens com suporte a multitenancy
 * Filtra mensagens por clinicId para garantir isolamento de dados
 */
@Injectable()
export class MensagensService {
  constructor(
    @Inject('IMensagensRepository')
    private readonly repo: IMensagensRepository,
    private readonly prometheus: PrometheusService,
  ) {}

  /**
   * Busca todas as mensagens de uma clínica específica
   * Garante isolamento de dados através do clinicId
   * 
   * @param clinicId - ID da clínica
   * @returns Array de mensagens filtradas por clinicId
   */
  async findAllByClinic(clinicId: string): Promise<Mensagem[]> {
    this.prometheus.incrementMensagensRequests();
    return this.repo.findAllByClinic(clinicId);
  }
}
