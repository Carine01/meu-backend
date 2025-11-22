import { Injectable, Logger } from '@nestjs/common';
import { Lead } from '../mensagens/entities/mensagem.entity';

/**
 * Service de cálculo de Score e determinação de Stages
 * 
 * REGRAS DE NEGÓCIO (35+ regras):
 * 
 * SCORE BASE:
 * - Lead novo: 20 pontos
 * 
 * COMPORTAMENTO LANDING PAGE:
 * - Time on page > 120s: +15 pontos
 * - Time on page > 60s: +10 pontos
 * - Scroll depth > 70%: +10 pontos
 * - Scroll depth > 50%: +5 pontos
 * - Vídeo assistido > 70%: +15 pontos
 * - Clicou botão WhatsApp: +25 pontos (alta intenção)
 * 
 * ORIGEM:
 * - Indicação: +20 pontos (confiança)
 * - WhatsApp direto: +15 pontos
 * - Instagram: +10 pontos
 * - Facebook Ads: +5 pontos
 * - Google Ads: +10 pontos
 * - Orgânico: +5 pontos
 * 
 * EVENTOS PÓS-CAPTAÇÃO:
 * - Agendamento criado: +30 pontos
 * - Mensagem simulada (resposta WhatsApp): +5 pontos/interação
 * - Compareceu à consulta: +25 pontos
 * - No-show: -15 pontos
 * - Reagendamento: +10 pontos (ainda interessado)
 * - Comprou pacote: +40 pontos
 * 
 * STAGES (baseado no score final):
 * - QUENTE (70-100): Prioridade máxima, autoridade suprema, fechar venda
 * - MORNO (40-69): Aquecimento, quebra de objeções, educação
 * - FRIO (0-39): Nutrição longa, reativação, conteúdo educacional
 * 
 * ETIQUETAS AUTOMÁTICAS:
 * - Gênero: Homens / Mulheres
 * - Faixa etária: Jovem (18-29), Adulto (30-44), 45PLUS (45+)
 * - Origem: WhatsAppLead, InstagramLead, IndicacaoLead, etc
 * - Comportamento: VideoWatcher (> 70%), DeepReader (scroll > 70%)
 * - Interesse: Definido pelo campo lead.interesse
 */
@Injectable()
export class LeadsScoreService {
  private readonly logger = new Logger(LeadsScoreService.name);

  /**
   * Calcula score completo do lead baseado em todas as métricas disponíveis
   * 
   * @param lead - Objeto lead com todos os campos
   * @returns Score de 0 a 100
   */
  calcularScore(lead: Partial<Lead>): number {
    let score = 20; // Base

    // === COMPORTAMENTO LANDING PAGE ===
    if (lead.timeOnPage) {
      if (lead.timeOnPage > 120) {
        score += 15;
        this.logger.debug(`[Score] +15 (time on page > 120s): ${lead.timeOnPage}s`);
      } else if (lead.timeOnPage > 60) {
        score += 10;
        this.logger.debug(`[Score] +10 (time on page > 60s): ${lead.timeOnPage}s`);
      }
    }

    if (lead.scrollDepth) {
      if (lead.scrollDepth > 70) {
        score += 10;
        this.logger.debug(`[Score] +10 (scroll depth > 70%): ${lead.scrollDepth}%`);
      } else if (lead.scrollDepth > 50) {
        score += 5;
        this.logger.debug(`[Score] +5 (scroll depth > 50%): ${lead.scrollDepth}%`);
      }
    }

    if (lead.videoPercent && lead.videoPercent > 70) {
      score += 15;
      this.logger.debug(`[Score] +15 (vídeo > 70%): ${lead.videoPercent}%`);
    }

    if (lead.clickedWhatsapp) {
      score += 25; // Alta intenção de contato
      this.logger.debug('[Score] +25 (clicou WhatsApp)');
    }

    // === ORIGEM ===
    if (lead.origem) {
      const origemLower = lead.origem.toLowerCase();
      
      if (origemLower.includes('indicacao') || origemLower.includes('indicação')) {
        score += 20;
        this.logger.debug('[Score] +20 (indicação)');
      } else if (origemLower.includes('whatsapp')) {
        score += 15;
        this.logger.debug('[Score] +15 (WhatsApp direto)');
      } else if (origemLower.includes('instagram') || origemLower.includes('ig')) {
        score += 10;
        this.logger.debug('[Score] +10 (Instagram)');
      } else if (origemLower.includes('google')) {
        score += 10;
        this.logger.debug('[Score] +10 (Google Ads)');
      } else if (origemLower.includes('facebook') || origemLower.includes('fb')) {
        score += 5;
        this.logger.debug('[Score] +5 (Facebook Ads)');
      } else if (origemLower.includes('organico') || origemLower.includes('orgânico')) {
        score += 5;
        this.logger.debug('[Score] +5 (Orgânico)');
      }
    }

    // === UTM TRACKING ===
    if (lead.gclid) {
      score += 5; // Google Ads tracking
      this.logger.debug('[Score] +5 (gclid presente)');
    }

    if (lead.fbclid) {
      score += 5; // Facebook Ads tracking
      this.logger.debug('[Score] +5 (fbclid presente)');
    }

    // Limitar score entre 0 e 100
    score = Math.min(100, Math.max(0, score));

    this.logger.log(`Score calculado para ${lead.nome || 'lead'}: ${score}`);
    return score;
  }

  /**
   * Determina stage do lead baseado no score
   * 
   * @param score - Score calculado (0-100)
   * @returns Stage: frio, morno ou quente
   */
  determinarStage(score: number): 'frio' | 'morno' | 'quente' {
    if (score >= 70) {
      return 'quente'; // Pronto para fechar, máxima prioridade
    } else if (score >= 40) {
      return 'morno'; // Aquecimento, quebra objeções
    } else {
      return 'frio'; // Nutrição longa, educação
    }
  }

  /**
   * Identifica etiquetas automáticas baseadas nos dados do lead
   * 
   * @param lead - Objeto lead
   * @returns Array de etiquetas
   */
  identificarEtiquetasIniciais(lead: Partial<Lead>): string[] {
    const etiquetas: string[] = [];

    // === GÊNERO ===
    if (lead.genero) {
      etiquetas.push(lead.genero); // "Homens" ou "Mulheres"
    }

    // === FAIXA ETÁRIA ===
    // TODO: Adicionar campo idade no Lead interface se necessário
    // Para agora, mantém logic condicional se existir
    const idade = (lead as any).idade;
    if (idade) {
      if (idade <= 29) {
        etiquetas.push('Jovem');
      } else if (idade <= 44) {
        etiquetas.push('Adulto');
      } else {
        etiquetas.push('45PLUS');
      }
    }

    // === ORIGEM ===
    if (lead.origem) {
      const origemLower = lead.origem.toLowerCase();
      
      if (origemLower.includes('whatsapp')) {
        etiquetas.push('WhatsAppLead');
      } else if (origemLower.includes('instagram')) {
        etiquetas.push('InstagramLead');
      } else if (origemLower.includes('indicacao') || origemLower.includes('indicação')) {
        etiquetas.push('IndicacaoLead');
      } else if (origemLower.includes('facebook')) {
        etiquetas.push('FacebookLead');
      } else if (origemLower.includes('google')) {
        etiquetas.push('GoogleLead');
      }
    }

    // === COMPORTAMENTO ===
    if (lead.videoPercent && lead.videoPercent > 70) {
      etiquetas.push('VideoWatcher');
    }

    if (lead.scrollDepth && lead.scrollDepth > 70) {
      etiquetas.push('DeepReader');
    }

    if (lead.clickedWhatsapp) {
      etiquetas.push('AltaIntencao');
    }

    // === INTERESSE ===
    if (lead.interesse) {
      // Normaliza interesse para etiqueta
      const interesseNormalizado = lead.interesse
        .trim()
        .replace(/\s+/g, '')
        .toLowerCase();
      
      etiquetas.push(`Interesse_${interesseNormalizado}`);
    }

    // === STATUS INICIAL ===
    etiquetas.push('NovoCliente'); // Todo lead novo recebe esta etiqueta

    this.logger.log(
      `Etiquetas identificadas para ${lead.nome || 'lead'}: ${etiquetas.join(', ')}`,
    );
    return etiquetas;
  }

  /**
   * Atualiza score de lead após evento específico
   * 
   * @param scoreAtual - Score atual do lead
   * @param evento - Tipo de evento ocorrido
   * @returns Novo score calculado
   */
  atualizarScorePorEvento(scoreAtual: number, evento: string): number {
    const incrementos: Record<string, number> = {
      agendamento_criado: 30,
      mensagem_simulada: 5, // Por interação WhatsApp
      compareceu: 25,
      no_show: -15,
      reagendamento: 10,
      comprou_pacote: 40,
      cancelou_agendamento: -10,
      pediu_desconto: -5, // Sensibilidade a preço
      respondeu_rapido: 10, // Resposta em < 5min
      visualizou_sem_responder: -2, // Viu mas não respondeu
    };

    const incremento = incrementos[evento] || 0;
    const novoScore = Math.min(100, Math.max(0, scoreAtual + incremento));

    this.logger.log(
      `Score atualizado: ${scoreAtual} → ${novoScore} (evento: ${evento}, Δ${incremento})`,
    );

    return novoScore;
  }

  /**
   * Adiciona etiquetas dinâmicas baseadas em comportamento
   * 
   * @param etiquetasAtuais - Etiquetas existentes do lead
   * @param evento - Evento que desencadeia nova etiqueta
   * @returns Novo array de etiquetas
   */
  adicionarEtiquetaDinamica(etiquetasAtuais: string[], evento: string): string[] {
    const novasEtiquetas = [...etiquetasAtuais];

    const mapeamentoEventoEtiqueta: Record<string, string> = {
      agendamento_criado: 'Agendado',
      compareceu: 'ClienteAtivo',
      no_show: 'NoShow',
      comprou_pacote: 'ClientePremium',
      reagendamento: 'Reagendou',
      cancelou_agendamento: 'Cancelou',
      D15_sem_retorno: 'Inativo15d',
      D30_sem_retorno: 'Inativo30d',
      D60_sem_retorno: 'Inativo60d',
      D90_sem_retorno: 'Inativo90d',
      D180_sem_retorno: 'Inativo180d',
    };

    const novaEtiqueta = mapeamentoEventoEtiqueta[evento];
    
    if (novaEtiqueta && !novasEtiquetas.includes(novaEtiqueta)) {
      novasEtiquetas.push(novaEtiqueta);
      this.logger.log(`Nova etiqueta adicionada: ${novaEtiqueta}`);
    }

    // Remove etiquetas conflitantes
    if (novaEtiqueta === 'ClienteAtivo') {
      // Remove etiquetas de inatividade
      const inativasRemover = novasEtiquetas.filter(e => e.startsWith('Inativo'));
      inativasRemover.forEach(e => {
        const index = novasEtiquetas.indexOf(e);
        if (index > -1) novasEtiquetas.splice(index, 1);
      });
      
      // Remove NoShow se compareceu
      const indexNoShow = novasEtiquetas.indexOf('NoShow');
      if (indexNoShow > -1) novasEtiquetas.splice(indexNoShow, 1);
    }

    return novasEtiquetas;
  }

  /**
   * Sugere próxima mensagem ideal baseada no stage e etiquetas
   * 
   * @param stage - Stage atual do lead
   * @param etiquetas - Etiquetas do lead
   * @returns Key da mensagem sugerida
   */
  sugerirProximaMensagem(stage: string, etiquetas: string[]): string {
    // Prioridade para reativação
    if (etiquetas.includes('Inativo30d')) {
      return 'REATIVACAO_D30';
    }
    if (etiquetas.includes('Inativo60d')) {
      return 'REATIVACAO_D60';
    }
    if (etiquetas.includes('Inativo90d')) {
      return 'REATIVACAO_D90';
    }

    // Confirmação de agendamento
    if (etiquetas.includes('Agendado')) {
      return 'CONFIRMACAO_24H';
    }

    // Mensagens por stage
    if (stage === 'quente') {
      return 'AUTH_SUPREMA_01'; // Escassez + autoridade
    } else if (stage === 'morno') {
      return 'BOASVINDAS_03'; // Credibilidade + pergunta fechada
    } else {
      return 'BOASVINDAS_01'; // Tom consultivo
    }
  }

  /**
   * Calcula prioridade de atendimento (0-10)
   * Usado para ordenar fila de atendimento humano
   * 
   * @param lead - Lead completo
   * @returns Prioridade de 0 (baixa) a 10 (altíssima)
   */
  calcularPrioridadeAtendimento(lead: Lead): number {
    let prioridade = 5; // Base média

    // Stage influencia fortemente
    if (lead.stage === 'quente') {
      prioridade += 3;
    } else if (lead.stage === 'morno') {
      prioridade += 1;
    }

    // Clicou WhatsApp = urgente
    if (lead.clickedWhatsapp) {
      prioridade += 2;
    }

    // Indicação = VIP
    if (lead.etiquetas.includes('IndicacaoLead')) {
      prioridade += 2;
    }

    // Cliente que já compareceu = prioridade alta
    if (lead.etiquetas.includes('ClienteAtivo')) {
      prioridade += 2;
    }

    // No-show recente = prioridade baixa
    if (lead.etiquetas.includes('NoShow')) {
      prioridade -= 2;
    }

    return Math.min(10, Math.max(0, prioridade));
  }
}

