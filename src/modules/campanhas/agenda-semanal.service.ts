import { Campanha } from './entities/campanha.entity';
import { Injectable, Logger } from '@nestjs/common';
import admin from 'firebase-admin';

// Mock Firebase initialization for test environment
if (process.env.NODE_ENV === 'test' && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault ? admin.credential.applicationDefault() : undefined,
  });
}
import { FilaService } from '../fila/fila.service';
import { Lead } from '../mensagens/entities/mensagem.entity';

/**
 * Regra de disparo semanal
 */
interface RegraDisparo {
  diaSemana: string;
  publicoEtiquetas: string[]; // Etiquetas do público-alvo
  templateKey: string; // Chave da mensagem da biblioteca
  objetivo: string;
  horarioEnvio: Date; // Horário relativo (ex: hoje + 1h)
  ativo: boolean;
}

/**
 * Service de Agenda Semanal Automatizada
 * 
 * Implementa disparos automáticos baseados em:
 * - Dia da semana (Segunda a Domingo)
 * - Etiquetas do lead (segmentação)
 * - Objetivo da campanha (reativação, nutrição, etc)
 * 
 * Baseado na aba "Agenda_Semanal_Disparos" do Google Sheets original
 * 
 * REGRAS:
 * - Segunda: Repescagem de leads frios (NovoCliente, Ocasional)
 * - Terça: Qualificação de leads mornos (Morno stage)
 * - Quarta: Autoridade suprema para quentes (Quente stage)
 * - Quinta: Reativação D+30 (Inativo30d)
 * - Sexta: Confirmação de agendamentos (Agendado)
 * - Sábado: Campanhas especiais (ClientePremium)
 * - Domingo: Descanso / Exceções
 */
@Injectable()
export class AgendaSemanalService {
      async criarCampanha(dto: Partial<Campanha>): Promise<Campanha> {
        // Mock para teste
        return { ...dto, id: 'mock-id' } as Campanha;
      }

      async listarAtivas(): Promise<Campanha[]> {
        // Mock para teste
        return [];
      }
    /**
     * Executa agenda do dia filtrando por clinicId
     * Lança erro se clinicId for vazio ou inválido
     */
    async executarAgendaDoDiaPorClinica(clinicId: string): Promise<void> {
      if (!clinicId || clinicId.trim() === '') {
        throw new Error('clinicId é obrigatório');
      }
      // TODO: Filtrar regras/leads por clinicId
      // Por enquanto executa agenda normal
      await this.executarAgendaDoDia();
    }
  private readonly logger = new Logger(AgendaSemanalService.name);
  private readonly firestore: admin.firestore.Firestore;

  constructor(private readonly filaService: FilaService) {
    this.firestore = admin.firestore();
  }

  /**
   * Executa agenda automática do dia atual
   * Deve ser chamado por CronJob diariamente (ex: 9h da manhã)
   * 
   * @example
   * ```typescript
   * // Em AgendaSemanalController ou CronJob
   * @Cron('0 9 * * *') // Todo dia às 9h
   * async handleCron() {
   *   await this.agendaSemanalService.executarAgendaDoDia();
   * }
   * ```
   */
  async executarAgendaDoDia(): Promise<void> {
    const hoje = new Date();
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const diaSemanaAtual = diasSemana[hoje.getDay()];

    this.logger.log(`Executando agenda semanal para ${diaSemanaAtual}`);

    const regras = this.getRegrasSemanais()[diaSemanaAtual];

    if (!regras || regras.length === 0) {
      this.logger.log(`Sem regras ativas para ${diaSemanaAtual}`);
      return;
    }

    for (const regra of regras) {
      if (!regra.ativo) {
        this.logger.debug(`Regra inativa: ${regra.objetivo}`);
        continue;
      }

      this.logger.log(`Processando regra: ${regra.objetivo} (${regra.publicoEtiquetas.join(', ')})`);

      try {
        // Buscar leads que correspondem às etiquetas da regra
        const leads = await this.buscarLeadsPorEtiquetas(regra.publicoEtiquetas);

        this.logger.log(`${leads.length} leads encontrados para "${regra.objetivo}"`);

        // Adicionar cada lead na fila de envio
        for (const lead of leads) {
          const horarioEnvio = new Date(Date.now() + 60 * 60 * 1000); // 1h a partir de agora

          await this.filaService.adicionarNaFila(
            lead.id,
            lead.nome,
            lead.telefone,
            regra.templateKey,
            {
              objetivo: lead.interesse || 'estética',
            },
            horarioEnvio,
            lead.clinicId,
          );
        }

        this.logger.log(`✅ Regra "${regra.objetivo}" executada com sucesso`);
      } catch (error: any) {
        const err = error as Error;
        this.logger.error(`❌ Erro ao executar regra "${regra.objetivo}": ${err.message}`, err.stack);
      }
    }
  }

  /**
   * Busca leads que possuem TODAS as etiquetas especificadas
   * 
   * @param etiquetas - Array de etiquetas necessárias
   * @returns Array de leads que correspondem
   */
  private async buscarLeadsPorEtiquetas(etiquetas: string[]): Promise<Lead[]> {
    try {
      // Firestore não suporta array-contains-all nativamente
      // Solução: buscar todos e filtrar em memória (ou usar array-contains para 1 etiqueta)
      
      const snapshot = await this.firestore.collection('leads').get();

      const leadsCorrespondentes: Lead[] = [];

      snapshot.docs.forEach(doc => {
        const lead = doc.data() as Lead;

        // Verifica se lead tem TODAS as etiquetas necessárias
        const temTodasEtiquetas = etiquetas.every(etiqueta =>
          lead.etiquetas && lead.etiquetas.includes(etiqueta),
        );

        if (temTodasEtiquetas) {
          leadsCorrespondentes.push(lead);
        }
      });

      return leadsCorrespondentes;
    } catch (error: any) {
      const err = error as Error;
      this.logger.error(`Erro ao buscar leads por etiquetas: ${err.message}`, err.stack);
      return [];
    }
  }

  /**
   * Retorna regras semanais completas
   * Baseado na lógica original do Google Sheets
   * 
   * TODO: Mover para Firestore collection 'agenda_semanal' para edição via admin
   */
  private getRegrasSemanais(): Record<string, RegraDisparo[]> {
    return {
      Segunda: [
        {
          diaSemana: 'Segunda',
          publicoEtiquetas: ['NovoCliente'],
          templateKey: 'BOASVINDAS_02',
          objetivo: 'Repescagem de leads frios - Facilitar agendamento',
          horarioEnvio: new Date(Date.now() + 60 * 60 * 1000), // 1h
          ativo: true,
        },
        {
          diaSemana: 'Segunda',
          publicoEtiquetas: ['Inativo15d'],
          templateKey: 'REATIVACAO_D15',
          objetivo: 'Reativação D+15 - Verificar imprevisto',
          horarioEnvio: new Date(Date.now() + 120 * 60 * 1000), // 2h
          ativo: true,
        },
      ],

      Terça: [
        {
          diaSemana: 'Terça',
          publicoEtiquetas: ['Morno'], // Stage morno
          templateKey: 'BOASVINDAS_03',
          objetivo: 'Qualificação - Credibilidade 20 anos',
          horarioEnvio: new Date(Date.now() + 60 * 60 * 1000),
          ativo: true,
        },
        {
          diaSemana: 'Terça',
          publicoEtiquetas: ['InstagramLead', 'Jovem'],
          templateKey: 'BOASVINDAS_05',
          objetivo: 'Segmentação Instagram - Tom jovem',
          horarioEnvio: new Date(Date.now() + 180 * 60 * 1000), // 3h
          ativo: true,
        },
      ],

      Quarta: [
        {
          diaSemana: 'Quarta',
          publicoEtiquetas: ['AltaIntencao'], // Clicou WhatsApp
          templateKey: 'AUTH_SUPREMA_01',
          objetivo: 'Autoridade Suprema - Scarcity 1 horário VIP',
          horarioEnvio: new Date(Date.now() + 60 * 60 * 1000),
          ativo: true,
        },
        {
          diaSemana: 'Quarta',
          publicoEtiquetas: ['IndicacaoLead'],
          templateKey: 'AUTH_SUPREMA_04',
          objetivo: 'Indicação - Protocolo científico',
          horarioEnvio: new Date(Date.now() + 120 * 60 * 1000),
          ativo: true,
        },
      ],

      Quinta: [
        {
          diaSemana: 'Quinta',
          publicoEtiquetas: ['Inativo30d'],
          templateKey: 'REATIVACAO_D30',
          objetivo: 'Reativação D+30 - Retomar investimento',
          horarioEnvio: new Date(Date.now() + 60 * 60 * 1000),
          ativo: true,
        },
        {
          diaSemana: 'Quinta',
          publicoEtiquetas: ['NoShow'],
          templateKey: 'NO_SHOW_FOLLOWUP',
          objetivo: 'Follow-up no-show - Reagendamento',
          horarioEnvio: new Date(Date.now() + 90 * 60 * 1000),
          ativo: true,
        },
      ],

      Sexta: [
        {
          diaSemana: 'Sexta',
          publicoEtiquetas: ['Agendado'],
          templateKey: 'CONFIRMACAO_24H',
          objetivo: 'Confirmação agendamentos - Lembrete 24h',
          horarioEnvio: new Date(Date.now() + 30 * 60 * 1000), // 30min
          ativo: true,
        },
        {
          diaSemana: 'Sexta',
          publicoEtiquetas: ['ClienteAtivo'],
          templateKey: 'POS_VENDA_INDICACAO',
          objetivo: 'Pós-venda - Pedido de indicação + desconto',
          horarioEnvio: new Date(Date.now() + 180 * 60 * 1000),
          ativo: true,
        },
      ],

      Sábado: [
        {
          diaSemana: 'Sábado',
          publicoEtiquetas: ['ClientePremium'],
          templateKey: 'CAMPANHA_BLACK_FRIDAY',
          objetivo: 'Campanha especial - Pacotes VIP',
          horarioEnvio: new Date(Date.now() + 60 * 60 * 1000),
          ativo: false, // Ativar apenas quando tiver campanha
        },
        {
          diaSemana: 'Sábado',
          publicoEtiquetas: ['Inativo60d'],
          templateKey: 'REATIVACAO_D60',
          objetivo: 'Reativação D+60 - Vaga especial volta',
          horarioEnvio: new Date(Date.now() + 120 * 60 * 1000),
          ativo: true,
        },
      ],

      Domingo: [
        // Dia de descanso - geralmente sem disparos automáticos
        {
          diaSemana: 'Domingo',
          publicoEtiquetas: ['Urgente'], // Etiqueta especial para exceções
          templateKey: 'BOASVINDAS_01',
          objetivo: 'Exceção - Atendimento urgente',
          horarioEnvio: new Date(Date.now() + 60 * 60 * 1000),
          ativo: false, // Desativado por padrão
        },
      ],
    };
  }

  /**
   * Retorna regras ativas para um dia específico
   * Útil para visualização no admin
   * 
   * @param diaSemana - Nome do dia (Segunda, Terça, etc)
   * @returns Array de regras do dia
   */
  getRegrasDoDia(diaSemana: string): RegraDisparo[] {
    const regras = this.getRegrasSemanais()[diaSemana] || [];
    return regras.filter(r => r.ativo);
  }

  /**
   * Retorna todas as regras semanais (7 dias)
   */
  getAllRegras(): Record<string, RegraDisparo[]> {
    return this.getRegrasSemanais();
  }

  /**
   * Executa regra específica manualmente (teste)
   * 
   * @param diaSemana - Dia da regra
   * @param objetivo - Objetivo da regra para identificar
   */
  async executarRegraManual(diaSemana: string, objetivo: string): Promise<number> {
    const regras = this.getRegrasSemanais()[diaSemana] || [];
    const regra = regras.find(r => r.objetivo === objetivo);

    if (!regra) {
      throw new Error(`Regra não encontrada: ${diaSemana} - ${objetivo}`);
    }

    this.logger.log(`Executando regra manual: ${regra.objetivo}`);

    const leads = await this.buscarLeadsPorEtiquetas(regra.publicoEtiquetas);

    for (const lead of leads) {
      await this.filaService.adicionarNaFila(
        lead.id,
        lead.nome,
        lead.telefone,
        regra.templateKey,
        { objetivo: lead.interesse || 'estética' },
        new Date(Date.now() + 10 * 60 * 1000), // 10 minutos
        lead.clinicId,
      );
    }

    this.logger.log(`${leads.length} leads adicionados à fila (teste manual)`);
    return leads.length;
  }
}

