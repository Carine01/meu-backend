import { Controller, Get, Header, UseGuards, Query } from '@nestjs/common';
import { BiService } from './bi.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClinicId } from '../../shared/decorators/clinic-id.decorator';

/**
 * Controller de Business Intelligence e Métricas
 * 
 * Endpoints:
 * - GET /bi/dashboard - Métricas do dashboard (autenticado)
 * - GET /bi/metrics - Prometheus metrics (público para scraper)
 * - GET /bi/funil - Análise de funil de conversão
 * - GET /bi/etiquetas - Top etiquetas
 * - GET /bi/origens - Performance por origem
 */
@Controller('bi')
@UseGuards(JwtAuthGuard)
export class BiController {
  constructor(private readonly biService: BiService) {}

  /**
   * Dashboard completo com métricas 30d/7d/hoje
   * Requer autenticação JWT
   * 
   * @example
   * GET /bi/dashboard
   * Authorization: Bearer <jwt-token>
   * x-clinic-id: CLINIC_ID
   * 
   * Response:
   * {
   *   "leads30d": 150,
   *   "agendados30d": 45,
   *   "comparecimentoPct": 87,
   *   "noShowPct": 8,
   *   ...
   * }
   */
  @Get('dashboard')
  async getDashboard(@ClinicId() clinicId: string) {
    return this.biService.getDashboardMetrics(clinicId);
  }

  /**
   * Métricas no formato Prometheus (text/plain)
   * Endpoint público para scraping automático
   * 
   * Configurar no prometheus.yml:
   * ```yaml
   * scrape_configs:
   *   - job_name: 'elevare'
   *     static_configs:
   *       - targets: ['backend:3000']
   *     metrics_path: '/bi/metrics'
   * ```
   * 
   * @example
   * GET /bi/metrics
   * x-clinic-id: CLINIC_ID
   * 
   * Response (text/plain):
   * # HELP elevare_leads_total Total de leads
   * # TYPE elevare_leads_total gauge
   * elevare_leads_total{periodo="30d"} 150
   * ...
   */
  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4')
  async getMetrics(@ClinicId() clinicId: string) {
    return this.biService.getPrometheusMetrics(clinicId);
  }

  /**
   * Análise de funil de conversão
   * Identifica gargalos no processo
   * 
   * @example
   * GET /bi/funil
   * x-clinic-id: CLINIC_ID
   * 
   * Response:
   * {
   *   "etapas": [
   *     { "etapa": "1. Lead Captado", "quantidade": 150, "percentual": 100 },
   *     { "etapa": "2. Agendamento Criado", "quantidade": 45, "percentual": 30 },
   *     { "etapa": "3. Compareceu", "quantidade": 39, "percentual": 26 }
   *   ],
   *   "taxaConversaoGeral": 26
   * }
   */
  @Get('funil')
  async getFunil(@ClinicId() clinicId: string) {
    return this.biService.getAnaliseFunil(clinicId);
  }

  /**
   * Top etiquetas mais comuns
   * Útil para segmentação de campanhas
   * 
   * @param limit - Quantidade de etiquetas (padrão: 10)
   * 
   * @example
   * GET /bi/etiquetas?limit=5
   * x-clinic-id: CLINIC_ID
   * 
   * Response:
   * [
   *   { "etiqueta": "Mulheres", "count": 120 },
   *   { "etiqueta": "WhatsAppLead", "count": 85 },
   *   { "etiqueta": "Adulto", "count": 70 },
   *   ...
   * ]
   */
  @Get('etiquetas')
  async getTopEtiquetas(
    @ClinicId() clinicId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.biService.getTopEtiquetas(clinicId, limitNum);
  }

  /**
   * Performance por origem (qual canal converte melhor?)
   * 
   * @example
   * GET /bi/origens
   * x-clinic-id: CLINIC_ID
   * 
   * Response:
   * [
   *   { "origem": "indicacao", "leads": 30, "agendamentos": 25, "taxaConversao": 83 },
   *   { "origem": "whatsapp", "leads": 50, "agendamentos": 30, "taxaConversao": 60 },
   *   { "origem": "instagram", "leads": 70, "agendamentos": 15, "taxaConversao": 21 },
   *   ...
   * ]
   */
  @Get('origens')
  async getPerformancePorOrigem(@ClinicId() clinicId: string) {
    return this.biService.getPerformancePorOrigem(clinicId);
  }
}

