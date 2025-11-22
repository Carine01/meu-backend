/**
 * Interface para templates de mensagens WhatsApp da biblioteca IARA
 * Preserva a estrutura original do Google Sheets: Biblioteca_Mensagens
 */
export interface MensagemTemplate {
  /** Identificador único da mensagem (ex: BOASVINDAS_01, AUTH_SUPREMA_05) */
  key: string;

  /** Stage do lead que recebe esta mensagem */
  stage: 'frio' | 'morno' | 'quente';

  /** Canal de comunicação (atualmente apenas WhatsApp) */
  canal: 'whatsapp';

  /** Se a mensagem está ativa para uso automático */
  ativo: boolean;

  /** Template com variáveis no formato {{variavel}} */
  template: string;

  /** Tags/categoria para filtros (opcional) */
  categoria?: 'boasvindas' | 'autoridade' | 'reativacao' | 'objecao' | 'campanha' | 'agenda';

  /** Descrição do propósito da mensagem */
  descricao?: string;
}

/**
 * Variáveis disponíveis para interpolação nos templates:
 * 
 * {{nome}} - Nome do lead/cliente
 * {{clinica}} - Nome da clínica (do perfil profissional)
 * {{objetivo}} - Objetivo/interesse do cliente (ex: "estética facial")
 * {{profissional}} - Nome do profissional
 * {{especialidade}} - Especialidade da clínica
 * {{data}} - Data formatada (conforme contexto)
 * {{hora}} - Horário formatado
 * {{hora2}} - Horário alternativo
 * {{procedimento}} - Nome do procedimento
 * {{valor}} - Valor formatado com R$
 * {{maps}} - Link do Google Maps da clínica
 * {{review}} - Link de avaliação
 * {{whatsapp}} - Telefone WhatsApp formatado
 */

/**
 * Estrutura completa de lead com score e etiquetas
 * Compatível com Firestore collection 'leads'
 */
export interface Lead {
  id: string;
  nome: string;
  telefone: string; // Formato E.164: +5511999999999
  email?: string;
  
  /** Gênero para segmentação de campanhas */
  genero?: 'Homens' | 'Mulheres';
  
  /** Origem do lead (form_site, indicacao, WhatsApp, Instagram, etc) */
  origem: string;
  
  /** UTM parameters para tracking */
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  gclid?: string;
  fbclid?: string;
  
  /** Métricas comportamentais do landing page */
  timeOnPage?: number; // segundos
  scrollDepth?: number; // percentual 0-100
  videoPercent?: number; // percentual assistido
  clickedWhatsapp: boolean;
  
  /** Score calculado automaticamente (0-100) */
  score: number;
  
  /** Stage determinado pelo score */
  stage: 'frio' | 'morno' | 'quente';
  
  /** Último evento registrado */
  lastEvent?: string;
  
  /** Array de etiquetas para segmentação */
  etiquetas: string[];
  
  /** Interesse/objetivo do cliente */
  interesse?: string;
  
  /** ID da clínica associada */
  clinicId?: string;
  
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Estrutura de agendamento
 * Compatível com Firestore collection 'agendamentos'
 */
export interface Agendamento {
  id: string;
  clinicId: string;
  nomePaciente: string;
  telefoneE164: string;
  procedimento: string;
  
  /** Data/hora em ISO 8601 com timezone */
  startISO: string;
  
  /** Duração em minutos */
  duracaoMinutos: number;
  
  /** Status do agendamento */
  status: 'agendado' | 'confirmado' | 'cancelado' | 'no_show' | 'compareceu';
  
  valor?: number;
  observacoes?: string;
  
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Item da fila de envio WhatsApp
 * Compatível com Firestore collection 'fila_envio'
 */
export interface FilaEnvio {
  id: string;
  
  /** Timestamp serial (Date.now() / 86400000) igual ao Google Sheets */
  tsCriado: number;
  
  destinoNome: string;
  destinoTelefone: string; // E.164
  
  /** Chave da mensagem da biblioteca */
  msgId: string;
  
  /** Texto final com variáveis resolvidas */
  textoResolvido: string;
  
  /** Status do envio */
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  
  clinicId: string;
  
  /** Tentativas de envio (máx 3) */
  attempts: number;
  
  /** Data/hora agendada para envio (opcional) */
  scheduledFor?: Date;
  
  /** Erro capturado na última tentativa */
  lastError?: string;
  
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Evento registrado no sistema
 * Compatível com Firestore collection 'eventos'
 */
export interface Evento {
  id?: string;
  
  /** Timestamp serial */
  ts: number;
  
  leadId: string;
  
  /** Tipo de evento (lead_novo, score_update, agendamento_criado, etc) */
  eventType: string;
  
  /** Pontos de score afetados */
  points: number;
  
  /** Fonte/origem do evento */
  source: string;
  
  /** Metadados JSON */
  meta: string;
  
  createdAt?: Date;
}

/**
 * Campanha de disparo
 * Compatível com Firestore collection 'campanhas'
 */
export interface Campanha {
  campanhaId: string;
  nome: string;
  
  /** Data de envio (serial date) */
  dataEnvio: number;
  
  /** Array de etiquetas do público-alvo */
  publico: string[];
  
  objetivo: string;
  mensagem: string;
  
  /** Gatilho/trigger da campanha */
  gatilho: string;
  
  status?: 'rascunho' | 'agendada' | 'enviando' | 'concluida' | 'cancelada';
  
  /** Estatísticas após envio */
  stats?: {
    total: number;
    enviados: number;
    falhas: number;
  };
  
  createdAt?: Date;
  updatedAt?: Date;
}

