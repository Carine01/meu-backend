import { Controller, Get, Header, UseGuards, Query, Req } from '@nestjs/common';
import { BiService } from './bi.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
   * Filtra por clinicId do usuário autenticado
   * 
   * @example
   * GET /bi/dashboard
   * Authorization: Bearer <jwt-token>
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
  async getDashboard(@Req() req: any) {
    const clinicId = req.user?.clinicId || 'ELEVARE_MAIN';
    return this.biService.getReportForClinic(clinicId);
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
   * 
   * Response (text/plain):
   * # HELP elevare_leads_total Total de leads
   * # TYPE elevare_leads_total gauge
   * elevare_leads_total{periodo="30d"} 150
   * ...
   */
  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4')
  async getMetrics() {
    return this.biService.getPrometheusMetrics();
  }

  /**
   * Análise de funil de conversão
   * Identifica gargalos no processo
   * Filtra por clinicId do usuário autenticado
   * 
   * @example
   * GET /bi/funil
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
  async getFunil(@Req() req: any) {
    const clinicId = req.user?.clinicId || 'ELEVARE_MAIN';
    // Use getReportForClinic to get clinic-specific data
    const metrics = await this.biService.getReportForClinic(clinicId);
    
    const etapas = [
      {
        etapa: '1. Lead Captado',
        quantidade: metrics.leads30d,
        percentual: 100,
      },
      {
        etapa: '2. Agendamento Criado',
        quantidade: metrics.agendados30d,
        percentual: metrics.leads30d > 0 ? Math.round((metrics.agendados30d / metrics.leads30d) * 100) : 0,
      },
      {
        etapa: '3. Compareceu',
        quantidade: metrics.compareceu30d,
        percentual: metrics.leads30d > 0 ? Math.round((metrics.compareceu30d / metrics.leads30d) * 100) : 0,
      },
    ];

    const taxaConversaoGeral = metrics.leads30d > 0 
      ? Math.round((metrics.compareceu30d / metrics.leads30d) * 100) 
      : 0;

    return { etapas, taxaConversaoGeral };
  }

  /**
   * Top etiquetas mais comuns
   * Útil para segmentação de campanhas
   * Filtra por clinicId do usuário autenticado
   * 
   * @param limit - Quantidade de etiquetas (padrão: 10)
   * 
   * @example
   * GET /bi/etiquetas?limit=5
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
  async getTopEtiquetas(@Query('limit') limit?: string, @Req() req?: any) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const clinicId = req.user?.clinicId || 'ELEVARE_MAIN';
    return this.biService.getTopEtiquetas(limitNum, clinicId);
  }

  /**
   * Performance por origem (qual canal converte melhor?)
   * Filtra por clinicId do usuário autenticado
   * 
   * @example
   * GET /bi/origens
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
  async getPerformancePorOrigem(@Req() req: any) {
    const clinicId = req.user?.clinicId || 'ELEVARE_MAIN';
    return this.biService.getPerformancePorOrigem(clinicId);
  }
}

