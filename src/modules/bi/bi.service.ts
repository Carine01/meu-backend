import { Injectable, Logger } from '@nestjs/common';
import admin from 'firebase-admin';

// Mock Firebase initialization for test environment
if (process.env.NODE_ENV === 'test' && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault ? admin.credential.applicationDefault() : undefined,
  });
}
import { Lead, Agendamento, FilaEnvio } from '../mensagens/entities/mensagem.entity';

/**
 * Métricas do Dashboard
 * Compatível com interface original do Google Sheets "Dashboard" aba
 */
export interface DashboardMetrics {
  // Leads
  leads30d: number;
  leads7d: number;
  leadsHoje: number;

  // Agendamentos
  agendados30d: number;
  agendados7d: number;
  agendadosHoje: number;

  // Comparecimento
  compareceu30d: number;
  comparecimentoPct: number;

  // No-Show
  noShow30d: number;
  noShowPct: number;

  // Reagendamentos
  reagendamentos30d: number;

  // Vendas (futuro)
  vendas30d: number;
  ticketMedio: number;

  // Fila
  filaPendente: number;
  filaEnviados30d: number;
  filaFalhas30d: number;

  // Scores médios
  scoreMedioLeads: number;
  percentualQuente: number;
  percentualMorno: number;
  percentualFrio: number;
}

/**
 * Service de Business Intelligence e Métricas
 * 
 * Funcionalidades:
 * - Dashboard com métricas 30d/7d/hoje
 * - Métricas Prometheus para scraping
 * - Análise de conversão e funil
 * - Estatísticas de performance
 */
@Injectable()
export class BiService {
    async summary(): Promise<any> {
      // Mock para teste
      return {};
    }

    async calcularConversao(clinicId: string): Promise<any> {
      // Mock para teste
      return {};
    }

    async metricasMensagens(): Promise<any> {
      // Mock para teste
      return {};
    }

    async metricasPorPeriodo(dataInicio: Date, dataFim: Date): Promise<any> {
      // Mock para teste
      return {};
    }
  private readonly logger = new Logger(BiService.name);
  private readonly firestore: admin.firestore.Firestore;

  constructor() {
    this.firestore = admin.firestore();
  }

    /**
     * Retorna relatório filtrado por clinicId
     * Lança erro se clinicId for vazio ou inválido
     */
    async getReportForClinic(clinicId: string): Promise<DashboardMetrics> {
      if (!clinicId || clinicId.trim() === '') {
        throw new Error('clinicId é obrigatório');
      }
      // TODO: Filtrar métricas por clinicId
      // Por enquanto retorna métricas padrão
      return await this.getDashboardMetrics();
    }

  /**
   * Retorna métricas completas do dashboard
   * Equivalente à aba "Dashboard" do Google Sheets original
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const agora = new Date();
    const thirtyDaysAgo = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

    try {
      // === LEADS ===
      const [leadsSnapshot30d, leadsSnapshot7d, leadsSnapshotHoje, allLeads] =
        await Promise.all([
          this.firestore
            .collection('leads')
            .where('createdAt', '>=', thirtyDaysAgo)
            .get(),
          this.firestore.collection('leads').where('createdAt', '>=', sevenDaysAgo).get(),
          this.firestore.collection('leads').where('createdAt', '>=', hoje).get(),
          this.firestore.collection('leads').get(),
        ]);

      const leads30d = leadsSnapshot30d.size;
      const leads7d = leadsSnapshot7d.size;
      const leadsHoje = leadsSnapshotHoje.size;

      // Calcular scores médios
      let somaScores = 0;
      let countQuente = 0;
      let countMorno = 0;
      let countFrio = 0;

      allLeads.docs.forEach(doc => {
        const lead = doc.data() as Lead;
        if (lead.score) somaScores += lead.score;
        if (lead.stage === 'quente') countQuente++;
        else if (lead.stage === 'morno') countMorno++;
        else if (lead.stage === 'frio') countFrio++;
      });

      const totalLeads = allLeads.size;
      const scoreMedioLeads = totalLeads > 0 ? Math.round(somaScores / totalLeads) : 0;
      const percentualQuente = totalLeads > 0 ? Math.round((countQuente / totalLeads) * 100) : 0;
      const percentualMorno = totalLeads > 0 ? Math.round((countMorno / totalLeads) * 100) : 0;
      const percentualFrio = totalLeads > 0 ? Math.round((countFrio / totalLeads) * 100) : 0;

      // === AGENDAMENTOS ===
      const [agendadosSnapshot30d, agendadosSnapshot7d, agendadosSnapshotHoje] =
        await Promise.all([
          this.firestore
            .collection('agendamentos')
            .where('createdAt', '>=', thirtyDaysAgo)
            .get(),
          this.firestore
            .collection('agendamentos')
            .where('createdAt', '>=', sevenDaysAgo)
            .get(),
          this.firestore
            .collection('agendamentos')
            .where('createdAt', '>=', hoje)
            .get(),
        ]);

      const agendados30d = agendadosSnapshot30d.size;
      const agendados7d = agendadosSnapshot7d.size;
      const agendadosHoje = agendadosSnapshotHoje.size;

      // === COMPARECIMENTO ===
      const compareceuSnapshot = await this.firestore
        .collection('agendamentos')
        .where('createdAt', '>=', thirtyDaysAgo)
        .where('status', '==', 'compareceu')
        .get();

      const compareceu30d = compareceuSnapshot.size;
      const comparecimentoPct = agendados30d > 0 ? Math.round((compareceu30d / agendados30d) * 100) : 0;

      // === NO-SHOW ===
      const noShowSnapshot = await this.firestore
        .collection('agendamentos')
        .where('createdAt', '>=', thirtyDaysAgo)
        .where('status', '==', 'no_show')
        .get();

      const noShow30d = noShowSnapshot.size;
      const noShowPct = agendados30d > 0 ? Math.round((noShow30d / agendados30d) * 100) : 0;

      // === REAGENDAMENTOS ===
      // TODO: Implementar lógica de detecção de reagendamento
      // Por enquanto, busca observações contendo "reagendado"
      const reagendamentosSnapshot = await this.firestore
        .collection('agendamentos')
        .where('createdAt', '>=', thirtyDaysAgo)
        .get();

      let reagendamentos30d = 0;
      reagendamentosSnapshot.docs.forEach(doc => {
        const agendamento = doc.data() as Agendamento;
        if (agendamento.observacoes?.toLowerCase().includes('reagendado')) {
          reagendamentos30d++;
        }
      });

      // === FILA DE ENVIO ===
      const [filaPendenteSnapshot, filaEnviados30d, filaFalhas30d] = await Promise.all([
        this.firestore
          .collection('fila_envio')
          .where('status', '==', 'pending')
          .get(),
        this.firestore
          .collection('fila_envio')
          .where('createdAt', '>=', thirtyDaysAgo)
          .where('status', '==', 'sent')
          .get(),
        this.firestore
          .collection('fila_envio')
          .where('createdAt', '>=', thirtyDaysAgo)
          .where('status', '==', 'failed')
          .get(),
      ]);

      // === VENDAS ===
      // TODO: Implementar módulo financeiro
      const vendas30d = 0;
      const ticketMedio = 0;

      const metrics: DashboardMetrics = {
        leads30d,
        leads7d,
        leadsHoje,
        agendados30d,
        agendados7d,
        agendadosHoje,
        compareceu30d,
        comparecimentoPct,
        noShow30d,
        noShowPct,
        reagendamentos30d,
        vendas30d,
        ticketMedio,
        filaPendente: filaPendenteSnapshot.size,
        filaEnviados30d: filaEnviados30d.size,
        filaFalhas30d: filaFalhas30d.size,
        scoreMedioLeads,
        percentualQuente,
        percentualMorno,
        percentualFrio,
      };

      this.logger.log(`Dashboard metrics calculadas: ${JSON.stringify(metrics)}`);
      return metrics;
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`Erro ao buscar métricas do dashboard: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Retorna métricas no formato Prometheus (text/plain)
   * Compatível com scraping do Prometheus
   * 
   * @example
   * ```
   * # HELP elevare_leads_total Total de leads
   * # TYPE elevare_leads_total gauge
   * elevare_leads_total{periodo="30d"} 150
   * ```
   */
  async getPrometheusMetrics(): Promise<string> {
    const metrics = await this.getDashboardMetrics();

    const metricsText = `
# HELP elevare_leads_total Total de leads captados
# TYPE elevare_leads_total gauge
elevare_leads_total{periodo="30d"} ${metrics.leads30d}
elevare_leads_total{periodo="7d"} ${metrics.leads7d}
elevare_leads_total{periodo="hoje"} ${metrics.leadsHoje}

# HELP elevare_agendamentos_total Total de agendamentos criados
# TYPE elevare_agendamentos_total gauge
elevare_agendamentos_total{periodo="30d"} ${metrics.agendados30d}
elevare_agendamentos_total{periodo="7d"} ${metrics.agendados7d}
elevare_agendamentos_total{periodo="hoje"} ${metrics.agendadosHoje}

# HELP elevare_conversao_percentual Taxa de conversão (leads → agendamentos)
# TYPE elevare_conversao_percentual gauge
elevare_conversao_percentual{periodo="30d"} ${metrics.leads30d > 0 ? Math.round((metrics.agendados30d / metrics.leads30d) * 100) : 0}

# HELP elevare_comparecimento_percentual Taxa de comparecimento
# TYPE elevare_comparecimento_percentual gauge
elevare_comparecimento_percentual{periodo="30d"} ${metrics.comparecimentoPct}

# HELP elevare_no_show_percentual Taxa de no-show
# TYPE elevare_no_show_percentual gauge
elevare_no_show_percentual{periodo="30d"} ${metrics.noShowPct}

# HELP elevare_reagendamentos_total Total de reagendamentos
# TYPE elevare_reagendamentos_total gauge
elevare_reagendamentos_total{periodo="30d"} ${metrics.reagendamentos30d}

# HELP elevare_fila_pendente Mensagens pendentes na fila
# TYPE elevare_fila_pendente gauge
elevare_fila_pendente ${metrics.filaPendente}

# HELP elevare_fila_enviados_total Mensagens enviadas com sucesso
# TYPE elevare_fila_enviados_total gauge
elevare_fila_enviados_total{periodo="30d"} ${metrics.filaEnviados30d}

# HELP elevare_fila_falhas_total Mensagens que falharam
# TYPE elevare_fila_falhas_total gauge
elevare_fila_falhas_total{periodo="30d"} ${metrics.filaFalhas30d}

# HELP elevare_score_medio Score médio dos leads
# TYPE elevare_score_medio gauge
elevare_score_medio ${metrics.scoreMedioLeads}

# HELP elevare_leads_por_stage Distribuição de leads por stage
# TYPE elevare_leads_por_stage gauge
elevare_leads_por_stage{stage="quente"} ${metrics.percentualQuente}
elevare_leads_por_stage{stage="morno"} ${metrics.percentualMorno}
elevare_leads_por_stage{stage="frio"} ${metrics.percentualFrio}
`.trim();

    return metricsText;
  }

  /**
   * Retorna análise de funil de conversão
   * Útil para identificar gargalos no processo
   */
  async getAnaliseFunil(): Promise<{
    etapas: Array<{ etapa: string; quantidade: number; percentual: number }>;
    taxaConversaoGeral: number;
  }> {
    const metrics = await this.getDashboardMetrics();

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
      // TODO: Adicionar etapa "4. Comprou" quando módulo financeiro estiver pronto
    ];

    const taxaConversaoGeral = metrics.leads30d > 0 
      ? Math.round((metrics.compareceu30d / metrics.leads30d) * 100) 
      : 0;

    return { etapas, taxaConversaoGeral };
  }

  /**
   * Retorna top etiquetas mais comuns
   * Útil para campanhas segmentadas
   */
  async getTopEtiquetas(limit: number = 10): Promise<Array<{ etiqueta: string; count: number }>> {
    try {
      const leadsSnapshot = await this.firestore.collection('leads').get();

      const etiquetasMap: Record<string, number> = {};

      leadsSnapshot.docs.forEach(doc => {
        const lead = doc.data() as Lead;
        if (lead.etiquetas && Array.isArray(lead.etiquetas)) {
          lead.etiquetas.forEach(etiqueta => {
            etiquetasMap[etiqueta] = (etiquetasMap[etiqueta] || 0) + 1;
          });
        }
      });

      // Ordenar por contagem decrescente
      const sorted = Object.entries(etiquetasMap)
        .map(([etiqueta, count]) => ({ etiqueta, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return sorted;
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`Erro ao buscar top etiquetas: ${err.message}`, err.stack);
      return [];
    }
  }

  /**
   * Retorna estatísticas de performance por origem
   * Qual canal traz leads com melhor conversão?
   */
  async getPerformancePorOrigem(): Promise<
    Array<{ origem: string; leads: number; agendamentos: number; taxaConversao: number }>
  > {
    try {
      const [leadsSnapshot, agendamentosSnapshot] = await Promise.all([
        this.firestore.collection('leads').get(),
        this.firestore.collection('agendamentos').get(),
      ]);

      const origemStats: Record<string, { leads: number; agendamentos: Set<string> }> = {};

      // Contar leads por origem
      leadsSnapshot.docs.forEach(doc => {
        const lead = doc.data() as Lead;
        const origem = lead.origem || 'desconhecido';

        if (!origemStats[origem]) {
          origemStats[origem] = { leads: 0, agendamentos: new Set() };
        }

        origemStats[origem].leads++;
      });

      // Contar agendamentos por origem (via telefone)
      agendamentosSnapshot.docs.forEach(doc => {
        const agendamento = doc.data() as Agendamento;
        const telefone = agendamento.telefoneE164;

        // Buscar origem do lead pelo telefone
        const leadDoc = leadsSnapshot.docs.find(
          l => (l.data() as Lead).telefone === telefone,
        );

        if (leadDoc) {
          const lead = leadDoc.data() as Lead;
          const origem = lead.origem || 'desconhecido';

          if (origemStats[origem]) {
            origemStats[origem].agendamentos.add(agendamento.id);
          }
        }
      });

      // Calcular taxas de conversão
      const resultado = Object.entries(origemStats)
        .map(([origem, stats]) => ({
          origem,
          leads: stats.leads,
          agendamentos: stats.agendamentos.size,
          taxaConversao:
            stats.leads > 0
              ? Math.round((stats.agendamentos.size / stats.leads) * 100)
              : 0,
        }))
        .sort((a, b) => b.taxaConversao - a.taxaConversao);

      return resultado;
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`Erro ao calcular performance por origem: ${err.message}`, err.stack);
      return [];
    }
  }
}

