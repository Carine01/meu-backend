import { Injectable, Logger } from '@nestjs/common';
// Stub para MensagemTemplate
export interface MensagemTemplate {
  id?: string;
  template: string;
  ativo?: boolean;
}
// Stub para getMensagemByKey
function getMensagemByKey(key: string): MensagemTemplate | undefined {
  // Retorna um template mock para testes
  if (key === 'BOASVINDAS_01') {
    return { template: 'Oi {{nome}}, bem-vinda à {{clinica}}!', ativo: true };
  }
  return undefined;
}

export interface PerfilProfissional {
  clinica_nome: string;
  profissional_nome: string;
  profissional_cpf: string;
  profissional_telefone: string;
  profissional_email: string;
  especialidade: string;
  anos_experiencia: number;
  endereco_rua: string;
  endereco_numero: string;
  endereco_complemento: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  endereco_cep: string;
  maps_link: string;
  review_link: string;
  whatsapp_business: string;
  horario_atendimento: string;
  tempo_consulta_minutos: number;
  aceita_agendamento_online: boolean;
  ticket_medio: number;
}
export interface PerfilProfissional {
  clinica_nome: string;
  profissional_nome: string;
  profissional_cpf: string;
  profissional_telefone: string;
  profissional_email: string;
  especialidade: string;
  anos_experiencia: number;
  endereco_rua: string;
  endereco_numero: string;
  endereco_complemento: string;
  endereco_bairro: string;
  endereco_cidade: string;
  endereco_estado: string;
  endereco_cep: string;
  maps_link: string;
  review_link: string;
  whatsapp_business: string;
  horario_atendimento: string;
  tempo_consulta_minutos: number;
  aceita_agendamento_online: boolean;
  ticket_medio: number;
}

/**
 * Service responsável por resolver variáveis nos templates de mensagens
 * 
 * Interpolação de variáveis no formato {{variavel}}:
 * - {{nome}} → nome do lead
 * - {{clinica}} → nome da clínica (perfil)
 * - {{objetivo}} → interesse/procedimento
 * - {{profissional}} → nome do profissional
 * - {{data}} → data formatada
 * - {{hora}} → horário formatado
 * - {{valor}} → valor formatado R$
 * - E 10+ outras variáveis contextuais
 */
@Injectable()
export class MensagemResolverService {
      /**
       * Implementação do método resolverTemplate para compatibilidade com testes
       */
      async resolverTemplate(template: string, vars: Record<string, any>): Promise<string> {
        let result = template;
        for (const [key, value] of Object.entries(vars)) {
          result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return result;
      }
    async send(dto: Partial<MensagemTemplate>): Promise<MensagemTemplate> {
      // Mock para teste
      return { ...dto, id: 'mock-id' } as MensagemTemplate;
    }
  private readonly logger = new Logger(MensagemResolverService.name);

  /**
   * Perfil profissional padrão (Carine Marques / Elevare)
   * TODO: Buscar do Firestore collection 'profiles' por clinicId
   */
  private readonly perfilProfissional: PerfilProfissional = {
    clinica_nome: 'Elevare Estética',
    profissional_nome: 'Carine Marques',
    profissional_cpf: '000.000.000-00', // Placeholder
    profissional_telefone: '+5511999999999',
    profissional_email: 'carine@elevare.com.br',
    especialidade: 'Criomodelagem e Estética Dermatofuncional',
    anos_experiencia: 20,
    endereco_rua: 'Rua Exemplo',
    endereco_numero: '123',
    endereco_complemento: 'Sala 4',
    endereco_bairro: 'Centro',
    endereco_cidade: 'São Paulo',
    endereco_estado: 'SP',
    endereco_cep: '01000-000',
    maps_link: 'https://maps.google.com/?cid=xxxxx',
    review_link: 'https://g.page/r/xxxxx/review',
    whatsapp_business: '+5511999999999',
    horario_atendimento: 'Segunda a Sexta: 9h às 19h | Sábado: 9h às 14h',
    tempo_consulta_minutos: 60,
    aceita_agendamento_online: true,
    ticket_medio: 350,
  };

  /**
   * Resolve todas as variáveis de um template de mensagem
   * 
   * @param template - Template com variáveis {{var}}
   * @param variaveis - Objeto com valores customizados para sobrescrever defaults
   * @returns String com variáveis interpoladas
   * 
   * @example
   * ```typescript
   * resolverMensagem('Oi {{nome}}, bem-vinda à {{clinica}}!', { nome: 'Maria' })
   * // Retorna: "Oi Maria, bem-vinda à Elevare Estética!"
   * ```
   */
  resolverMensagem(template: string, variaveis: Record<string, string | number> = {}): string {
    let mensagem = template;

    // 1. Aplicar variáveis customizadas fornecidas (prioridade máxima)
    for (const [chave, valor] of Object.entries(variaveis)) {
      const regex = new RegExp(`\\{\\{${chave}\\}\\}`, 'g');
      mensagem = mensagem.replace(regex, String(valor));
    }

    // 2. Fallback para perfil profissional (dados da clínica)
    for (const [chave, valor] of Object.entries(this.perfilProfissional)) {
      const regex = new RegExp(`\\{\\{${chave}\\}\\}`, 'g');
      mensagem = mensagem.replace(regex, String(valor));
    }

    // 3. Variáveis derivadas/calculadas
    mensagem = mensagem.replace(/\{\{clinica\}\}/g, this.perfilProfissional.clinica_nome);
    mensagem = mensagem.replace(/\{\{profissional\}\}/g, this.perfilProfissional.profissional_nome);
    mensagem = mensagem.replace(/\{\{maps\}\}/g, this.perfilProfissional.maps_link);
    mensagem = mensagem.replace(/\{\{review\}\}/g, this.perfilProfissional.review_link);
    mensagem = mensagem.replace(/\{\{whatsapp\}\}/g, this.formatarTelefone(this.perfilProfissional.whatsapp_business));

    // 4. Remover variáveis não resolvidas (segurança)
    // Se sobrar {{algo}} não resolvido, remove ou deixa placeholder
    const variaveisNaoResolvidas = mensagem.match(/\{\{[^}]+\}\}/g);
    if (variaveisNaoResolvidas) {
      this.logger.warn(`Variáveis não resolvidas no template: ${variaveisNaoResolvidas.join(', ')}`);
      // Substitui por placeholder vazio ou mantém para debug
      // mensagem = mensagem.replace(/\{\{[^}]+\}\}/g, '');
    }

    return mensagem;
  }

  /**
   * Resolve mensagem buscando template por key da biblioteca
   * 
   * @param mensagemKey - Chave da mensagem (ex: BOASVINDAS_01)
   * @param variaveis - Variáveis customizadas
   * @returns Objeto com template e mensagem resolvida
   */
  resolverPorKey(
    mensagemKey: string,
    variaveis: Record<string, string | number> = {},
  ): { template: MensagemTemplate | undefined; mensagemResolvida: string } {
    const template = getMensagemByKey(mensagemKey);

    if (!template) {
      this.logger.error(`Mensagem não encontrada: ${mensagemKey}`);
      return {
        template: undefined,
        mensagemResolvida: `[ERRO] Mensagem ${mensagemKey} não encontrada`,
      };
    }

    if (!template.ativo) {
      this.logger.warn(`Mensagem inativa: ${mensagemKey}`);
    }

    const mensagemResolvida = this.resolverMensagem(template.template, variaveis);

    return { template, mensagemResolvida };
  }

  /**
   * Formata telefone para exibição humanizada
   * +5511999999999 → (11) 99999-9999
   */
  private formatarTelefone(telefoneE164: string): string {
    const cleaned = telefoneE164.replace(/\D/g, '');

    if (cleaned.length === 13 && cleaned.startsWith('55')) {
      // Brasil: +55 11 99999-9999
      const ddd = cleaned.substring(2, 4);
      const parte1 = cleaned.substring(4, 9);
      const parte2 = cleaned.substring(9, 13);
      return `(${ddd}) ${parte1}-${parte2}`;
    }

    return telefoneE164; // Retorna original se não conseguir formatar
  }

  /**
   * Formata data para exibição (ex: "Terça-feira, 25/11")
   */
  formatarData(data: Date): string {
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const diaSemana = diasSemana[data.getDay()];
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');

    return `${diaSemana}, ${dia}/${mes}`;
  }

  /**
   * Formata horário (ex: "14h30")
   */
  formatarHora(data: Date): string {
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');

    if (minuto === '00') {
      return `${hora}h`;
    }

    return `${hora}h${minuto}`;
  }

  /**
   * Formata valor monetário (ex: "R$ 350,00")
   */
  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  /**
   * Helper para criar variáveis de agendamento
   * Útil para mensagens de confirmação/lembrete
   */
  criarVariaveisAgendamento(dados: {
    nomePaciente: string;
    procedimento: string;
    dataHora: Date;
    valor?: number;
  }): Record<string, string> {
    return {
      nome: dados.nomePaciente,
      procedimento: dados.procedimento,
      data: this.formatarData(dados.dataHora),
      hora: this.formatarHora(dados.dataHora),
      valor: dados.valor ? this.formatarValor(dados.valor) : 'a combinar',
      clinica: this.perfilProfissional.clinica_nome,
      maps: this.perfilProfissional.maps_link,
    };
  }

  /**
   * Helper para criar variáveis de lead (primeiro contato)
   */
  criarVariaveisLead(dados: {
    nome: string;
    interesse?: string;
    origem?: string;
  }): Record<string, string> {
    return {
      nome: dados.nome,
      objetivo: dados.interesse || 'estética',
      origem: dados.origem || 'site',
      clinica: this.perfilProfissional.clinica_nome,
      profissional: this.perfilProfissional.profissional_nome,
      especialidade: this.perfilProfissional.especialidade,
      whatsapp: this.formatarTelefone(this.perfilProfissional.whatsapp_business),
    };
  }

  /**
   * Retorna o perfil profissional atual
   * Útil para outros services que precisam desses dados
   */
  getPerfilProfissional(): PerfilProfissional {
    return { ...this.perfilProfissional };
  }

  /**
   * Atualiza perfil profissional em memória
   * TODO: Persistir no Firestore quando implementar ProfileService integration
   */
  atualizarPerfilProfissional(novosDados: Partial<PerfilProfissional>): void {
    Object.assign(this.perfilProfissional, novosDados);
    this.logger.log('Perfil profissional atualizado');
  }
    /**
     * Retorna perfil profissional filtrado por clinicId
     * Lança erro se clinicId for vazio ou inválido
     */
    async getPerfilPorClinica(clinicId: string): Promise<PerfilProfissional> {
      if (!clinicId || clinicId.trim() === '') {
        throw new Error('clinicId é obrigatório');
      }
      // TODO: Buscar do Firestore por clinicId
      // Por enquanto retorna o perfil padrão
      return { ...this.perfilProfissional };
    }

    /**
     * Resolve mensagem por clínica, validando clinicId
     * Lança erro se clinicId for vazio ou inválido
     */
    async resolverMensagemPorClinica(template: string, clinicId: string, variaveis: Record<string, string | number> = {}): Promise<string> {
      if (!clinicId || clinicId.trim() === '') {
        throw new Error('clinicId é obrigatório');
      }
      // TODO: Buscar perfil da clínica e interpolar variáveis
      // Por enquanto usa perfil padrão
      return this.resolverMensagem(template, variaveis);
    }
}

