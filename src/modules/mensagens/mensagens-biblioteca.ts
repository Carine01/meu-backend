import { MensagemTemplate } from './entities/mensagem.entity';

/**
 * BIBLIOTECA DE MENSAGENS IARA - 119 MENSAGENS HUMANIZADAS
 * 
 * Baseada na "alma" do sistema original Google Sheets
 * Cada mensagem preserva: tom humanizado, objetivo estratégico, stage apropriado
 * 
 * CATEGORIAS:
 * - BOASVINDAS: Primeiro contato (frio/morno)
 * - AUTH_SUPREMA: Autoridade + scarcity + decisão (quente)
 * - REATIVACAO: D+15, D+30, D+60, D+90, D+180
 * - OBJECAO: Preço, tempo, dúvidas
 * - CONFIRMACAO: Lembretes 24h/2h antes
 * - POS_VENDA: Agradecimento, avaliação, fidelização
 * - CAMPANHA: Ofertas sazonais, premium
 */

export const BIBLIOTECA_MENSAGENS: Record<string, MensagemTemplate> = {
  // ========================================
  // BOAS-VINDAS (FRIO/MORNO) - 20 variações
  // ========================================
  BOASVINDAS_01: {
    key: 'BOASVINDAS_01',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, aqui é da {{clinica}} 🌸. Quero te ajudar em {{objetivo}} sem correria. Prefere manhã, tarde ou sábado? Eu encaixo no VIP.',
    descricao: 'Primeiro contato imediato, tom consultivo e flexibilidade'
  },
  
  BOASVINDAS_02: {
    key: 'BOASVINDAS_02',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Passei pra facilitar: me diz 2 janelas desta semana e eu organizo tudo pra você focar em {{objetivo}} sem perder tempo.',
    descricao: 'Foco na praticidade e economia de tempo do cliente'
  },
  
  BOASVINDAS_03: {
    key: 'BOASVINDAS_03',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Vi que você tá procurando {{objetivo}} — a gente trabalha com {{especialidade}} há 20 anos. Tenho 2 horários esta semana: {{hora}} ou {{hora2}}. Qual funciona melhor?',
    descricao: 'Credibilidade (20 anos) + escassez (2 horários) + pergunta fechada'
  },

  BOASVINDAS_04: {
    key: 'BOASVINDAS_04',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}! Acabei de ver sua mensagem. Te pergunto: prefere um horário mais tranquilo (menos gente) ou um horário normal? Porque eu ainda tenho 1 vaga especial amanhã às 15h.',
    descricao: 'Tom exclusivo + urgência leve + escolha personalizada'
  },

  BOASVINDAS_05: {
    key: 'BOASVINDAS_05',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Oi {{nome}}! Recebi seu contato e já separei 3 opções de horário pra gente conversar sobre {{objetivo}}. Pode ser por aqui mesmo, rapidinho. Topa?',
    descricao: 'Preparação prévia + baixa fricção (WhatsApp) + confirmação simples'
  },

  BOASVINDAS_06: {
    key: 'BOASVINDAS_06',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, vi que você se interessou por {{objetivo}}. Sou especialista nisso há anos. Que tal marcarmos uma conversa? Tenho encaixe esta semana.',
    descricao: 'Expertise + disponibilidade imediata'
  },

  BOASVINDAS_07: {
    key: 'BOASVINDAS_07',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Oi! Notei seu interesse em {{objetivo}}. Trabalho com casos assim todos os dias. Posso te mostrar como funciona? É rápido e sem compromisso.',
    descricao: 'Experiência + baixa pressão + convite leve'
  },

  BOASVINDAS_08: {
    key: 'BOASVINDAS_08',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, que bom te ter aqui! Vamos direto ao ponto: qual o melhor dia da semana pra você? Eu adapto minha agenda.',
    descricao: 'Entusiasmo + pragmatismo + flexibilidade'
  },

  BOASVINDAS_09: {
    key: 'BOASVINDAS_09',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Passei aqui pra te dar um oi! Vi que você quer cuidar de {{objetivo}}. Tenho protocolo específico pra isso. Quer saber mais? Me chama.',
    descricao: 'Tom amigável + especialização + abertura para diálogo'
  },

  BOASVINDAS_10: {
    key: 'BOASVINDAS_10',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, recebi sua mensagem! Antes de mais nada: você prefere atendimento presencial ou online? Tenho as duas opções disponíveis.',
    descricao: 'Confirmação + opções (híbrido) + praticidade'
  },

  BOASVINDAS_11: {
    key: 'BOASVINDAS_11',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Oi {{nome}}! Você se cadastrou pra {{objetivo}}, certo? Perfeito. Vou te mandar 2 horários VIP que acabaram de abrir. Aguarde...',
    descricao: 'Confirmação de interesse + exclusividade + promessa de ação'
  },

  BOASVINDAS_12: {
    key: 'BOASVINDAS_12',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, me conta: o que te trouxe aqui? Quero entender melhor pra te oferecer exatamente o que você precisa em {{objetivo}}.',
    descricao: 'Pergunta aberta + personalização + escuta ativa'
  },

  BOASVINDAS_13: {
    key: 'BOASVINDAS_13',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Olá! Vi seu interesse e já fiz uma pré-seleção de horários pra você. Prefere conversar primeiro ou já marca direto?',
    descricao: 'Preparação antecipada + autonomia do cliente'
  },

  BOASVINDAS_14: {
    key: 'BOASVINDAS_14',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, aqui quem fala é da {{clinica}}. Você está no lugar certo pra resolver {{objetivo}}. Me passa sua disponibilidade e eu organizo tudo.',
    descricao: 'Reasseguramento + solução + call to action prático'
  },

  BOASVINDAS_15: {
    key: 'BOASVINDAS_15',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Oi! Recebi sua solicitação sobre {{objetivo}}. Trabalho com resultado comprovado. Quer ver alguns casos antes ou prefere marcar logo?',
    descricao: 'Social proof implícito + autonomia + opções'
  },

  BOASVINDAS_16: {
    key: 'BOASVINDAS_16',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, prazer! Sou a responsável por {{especialidade}}. Vou facilitar: me diz 2 dias que você pode e eu monto sua agenda. Combinado?',
    descricao: 'Apresentação pessoal + facilitação + compromisso mútuo'
  },

  BOASVINDAS_17: {
    key: 'BOASVINDAS_17',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Vi que você quer {{objetivo}}. Ótima escolha! Nosso protocolo tem 95% de satisfação. Posso te encaixar esta semana. Interesse?',
    descricao: 'Validação + estatística convincente + disponibilidade'
  },

  BOASVINDAS_18: {
    key: 'BOASVINDAS_18',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, você chegou no momento certo. Estou com agenda aberta só até quinta-feira. Depois fecha. Prefere manhã ou tarde?',
    descricao: 'Timing + scarcity leve + pergunta fechada'
  },

  BOASVINDAS_19: {
    key: 'BOASVINDAS_19',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Oi {{nome}}! Aqui é da equipe {{clinica}}. Você demonstrou interesse em {{objetivo}}. Vou te contar como funciona, pode ser?',
    descricao: 'Identificação da equipe + confirmação + oferta educativa'
  },

  BOASVINDAS_20: {
    key: 'BOASVINDAS_20',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, seja bem-vinda! 🌸 Vou te ajudar com {{objetivo}} de forma personalizada. Primeira pergunta: você já fez algo parecido antes?',
    descricao: 'Acolhimento + personalização + qualificação'
  },

  // ========================================
  // AUTORIDADE SUPREMA (QUENTE) - 25 variações
  // ========================================
  AUTH_SUPREMA_01: {
    key: 'AUTH_SUPREMA_01',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: '{{nome}}, vou ser direta: sobrou 1 horário esta semana porque alguém desmarcou. {{data}} às {{hora}}. É VIP, com todo o tempo do mundo pra você. Confirmo?',
    descricao: 'Transparência + scarcity (1 horário) + exclusividade VIP'
  },

  AUTH_SUPREMA_02: {
    key: 'AUTH_SUPREMA_02',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: 'Decidir é simples quando há clareza. Segurei {{data}} {{hora}} e {{hora2}} por 2h. Confirmo?',
    descricao: 'Frase de impacto + segura temporária + deadline implícito'
  },

  AUTH_SUPREMA_03: {
    key: 'AUTH_SUPREMA_03',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: 'Olha, {{nome}}: eu não faço corpo de bombeiros. Se você quer resultado em {{objetivo}}, preciso que venha preparada pra decisão. Pode ser {{data}} às {{hora}}?',
    descricao: 'Autoridade consultiva + qualificação + expectativa de comprometimento'
  },

  AUTH_SUPREMA_04: {
    key: 'AUTH_SUPREMA_04',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: '{{nome}}, trabalho com protocolo científico. Não prometo milagre, prometo método. Se faz sentido, vem {{data}} e a gente desenha seu protocolo personalizado. Topou?',
    descricao: 'Credibilidade técnica + expectativa realista + personalização'
  },

  AUTH_SUPREMA_05: {
    key: 'AUTH_SUPREMA_05',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: 'Vou te falar um segredo: a maioria espera "segunda-feira" pra começar. Os que decidem hoje são os que chegam no resultado antes. {{data}} às {{hora}}. Vem?',
    descricao: 'Insight psicológico + senso de urgência + convite direto'
  },

  AUTH_SUPREMA_06: {
    key: 'AUTH_SUPREMA_06',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: '{{nome}}, não sou pra todo mundo. Trabalho com quem decide rápido e executa. Se é você, vem {{data}}. Se não, sem problema — mas não me procure depois.',
    descricao: 'Qualificação forte + ultimato suave + polarização'
  },

  AUTH_SUPREMA_07: {
    key: 'AUTH_SUPREMA_07',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: 'Última vaga da semana. {{data}} às {{hora}}. Se você quer resultado em {{objetivo}}, essa é sua chance. Depois disso, só semana que vem. Confirmo agora?',
    descricao: 'Scarcity extrema + deadline + call to action urgente'
  },

  AUTH_SUPREMA_08: {
    key: 'AUTH_SUPREMA_08',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: '{{nome}}, vou te poupar tempo: ou você decide agora ou eu passo pra próxima da lista. Tenho 5 pessoas aguardando. {{data}} às {{hora}}. Sim ou não?',
    descricao: 'Transparência brutal + prova social + binário'
  },

  AUTH_SUPREMA_09: {
    key: 'AUTH_SUPREMA_09',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: 'Olha, {{nome}}: eu não persigo cliente. Você veio até mim, eu apresentei a solução. Agora é decisão sua. Quer resultado? Vem {{data}}. Não quer? Tudo bem também.',
    descricao: 'Autonomia total + sem pressão (reversa) + autoridade'
  },

  AUTH_SUPREMA_10: {
    key: 'AUTH_SUPREMA_10',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: '{{nome}}, acabou de cancelar uma cliente VIP. Sobrou {{data}} às {{hora}}. É horário nobre. Você topa ou prefiro oferecer pra lista de espera?',
    descricao: 'Oportunidade rara + valor percebido + urgência social'
  },

  AUTH_SUPREMA_11: {
    key: 'AUTH_SUPREMA_11',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: 'Sinceridade: eu não faço milagre, faço planejamento. Se você quer resultado rápido e fácil, não sou eu. Se quer resultado real, vem {{data}}. Decide.',
    descricao: 'Expectativa realista + posicionamento técnico + desafio'
  },

  AUTH_SUPREMA_12: {
    key: 'AUTH_SUPREMA_12',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: '{{nome}}, vou segurar {{data}} {{hora}} por 1h. Depois disso, libero. Você confirma ou eu ofereço pra próxima?',
    descricao: 'Deadline real + transparência + call to action imediato'
  },

  AUTH_SUPREMA_13: {
    key: 'AUTH_SUPREMA_13',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: 'Deixa eu ser direta: quem fica pensando demais não sai do lugar. Eu tenho a solução, você tem o problema. {{data}} às {{hora}}. Bora resolver?',
    descricao: 'Confronto produtivo + solucionismo + empoderamento'
  },

  AUTH_SUPREMA_14: {
    key: 'AUTH_SUPREMA_14',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: '{{nome}}, minha agenda fecha rápido porque eu não atendo todo mundo. Atendo bem. Você quer entrar ou não? {{data}} às {{hora}}. Última chamada.',
    descricao: 'Exclusividade + qualidade > quantidade + ultimato'
  },

  AUTH_SUPREMA_15: {
    key: 'AUTH_SUPREMA_15',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: 'Olha, {{nome}}: eu poderia ficar te convencendo, mas não é meu estilo. Você quer ou não quer? {{data}} às {{hora}}. Responde com "Quero" ou "Não quero".',
    descricao: 'Anti-venda + respeito + simplicidade binária'
  },

  AUTH_SUPREMA_16: {
    key: 'AUTH_SUPREMA_16',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: '{{nome}}, acabei de revisar minha agenda. Tenho {{data}} livre. Depois disso, só daqui 2 semanas. Você escolhe: espera ou decide agora?',
    descricao: 'Scarcity temporal + autonomia + consequência clara'
  },

  AUTH_SUPREMA_17: {
    key: 'AUTH_SUPREMA_17',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: 'Vou falar algo que ninguém fala: resultado depende mais de você do que de mim. Eu entrego o método, você executa. Topa essa parceria? {{data}} às {{hora}}.',
    descricao: 'Verdade inconveniente + co-responsabilização + convite'
  },

  AUTH_SUPREMA_18: {
    key: 'AUTH_SUPREMA_18',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: '{{nome}}, trabalho com protocolo internacional. Não é barato, não é rápido, mas é o que funciona. Se faz sentido, vem {{data}}. Se não, sem ressentimentos.',
    descricao: 'Posicionamento premium + expectativa real + respeito mútuo'
  },

  AUTH_SUPREMA_19: {
    key: 'AUTH_SUPREMA_19',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: 'Última vez que te ofereço esse horário, {{nome}}. {{data}} às {{hora}}. Depois disso, você entra na fila de espera normal (2-3 semanas). Decide.',
    descricao: 'Ultimato + consequência específica + empoderamento'
  },

  AUTH_SUPREMA_20: {
    key: 'AUTH_SUPREMA_20',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: '{{nome}}, eu respeito quem pensa antes de decidir. Mas também respeito minha agenda. Te dou até hoje às 18h pra confirmar {{data}} {{hora}}. Depois, libero.',
    descricao: 'Respeito bilateral + deadline concreto + firmeza'
  },

  // ========================================
  // REATIVAÇÃO (D+15, D+30, D+60, D+90, D+180) - 15 variações
  // ========================================
  REATIVACAO_D15: {
    key: 'REATIVACAO_D15',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'reativacao',
    template: '{{nome}}, notei que você não voltou desde nossa primeira conversa. Rolou algum imprevisto? Quero garantir que você não perdeu a chance de cuidar de {{objetivo}}. Posso te encaixar esta semana.',
    descricao: 'Empatia + cuidado genuíno + nova oportunidade (15 dias)'
  },

  REATIVACAO_D30: {
    key: 'REATIVACAO_D30',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'reativacao',
    template: 'Oi {{nome}}! Passou 1 mês e eu lembrei de você. Sei que vida é corrida, mas {{objetivo}} é investimento em você mesma. Que tal retomar? Tenho horários livres esta semana.',
    descricao: 'Tom amigável + validação da rotina + incentivo (30 dias)'
  },

  REATIVACAO_D60: {
    key: 'REATIVACAO_D60',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'reativacao',
    template: '{{nome}}, já faz 2 meses... Quer saber? Eu guardo vaga especial pra quem some e volta. Porque sei que às vezes não é o momento certo. Agora tá sendo? Me conta.',
    descricao: 'Tom compreensivo + oferta exclusiva "volta" + abertura (60 dias)'
  },

  REATIVACAO_D90: {
    key: 'REATIVACAO_D90',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'reativacao',
    template: 'Última vez que conversamos foi há 3 meses, {{nome}}. Continua interessada em {{objetivo}}? Porque acabou de abrir vaga e lembrei de você. Responde só "sim" ou "não", sem compromisso.',
    descricao: 'Franqueza + pergunta binária (baixa fricção) + 90 dias'
  },

  REATIVACAO_D180: {
    key: 'REATIVACAO_D180',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'reativacao',
    template: '{{nome}}, meio ano se passou. Tudo bem por aí? Só queria saber se {{objetivo}} ainda faz sentido pra você. Caso sim, te dou prioridade na agenda. Caso não, sem problema — vida muda. Me conta?',
    descricao: 'Tom humanizado + sem pressão + oferta de prioridade (180 dias)'
  },

  D2_POST_CADASTRO: {
    key: 'D2_POST_CADASTRO',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'reativacao',
    template: 'Oi {{nome}}! Passaram 2 dias desde nosso primeiro contato. Conseguiu pensar nos horários? Tenho {{data}} e {{data2}} disponíveis ainda. Qual prefere?',
    descricao: 'Followup D+2 + facilitação + opções concretas'
  },

  D5_NURTURE: {
    key: 'D5_NURTURE',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'reativacao',
    template: '{{nome}}, já faz quase 1 semana. Sei que decisão leva tempo. Mas deixa eu te contar: 90% das minhas clientes disseram que o maior arrependimento foi não ter começado antes. Bora marcar?',
    descricao: 'D+5 + social proof + reframe (arrependimento) + CTA'
  },

  D7_ULTIMATO_LEVE: {
    key: 'D7_ULTIMATO_LEVE',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'reativacao',
    template: '{{nome}}, 1 semana se passou. Vou ser sincera: se não é agora, talvez não seja o momento. Mas caso ainda tenha interesse, me chama. Deixo a porta aberta.',
    descricao: 'D+7 + honestidade + respeito + abertura'
  },

  D15_REENGAJAMENTO: {
    key: 'D15_REENGAJAMENTO',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'reativacao',
    template: '{{nome}}, percebi que você sumiu. Tudo bem? Às vezes a vida aperta mesmo. Caso queira retomar {{objetivo}}, tenho novidades: protocolo atualizado e horários mais flexíveis. Interesse?',
    descricao: 'D+15 + empatia + novidade (reframing) + convite'
  },

  D30_SEGUNDA_CHANCE: {
    key: 'D30_SEGUNDA_CHANCE',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'reativacao',
    template: '{{nome}}, passou 1 mês. Não sei se ainda faz sentido, mas acabou de abrir 1 vaga especial pra quem tinha demonstrado interesse. É sua se quiser. Responde só "quero" ou "deixa pra lá".',
    descricao: 'D+30 + oportunidade exclusiva + baixa fricção (binário)'
  },

  D60_CHECKIN: {
    key: 'D60_CHECKIN',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'reativacao',
    template: 'Oi {{nome}}! Faz tempo, né? 2 meses. Só passei pra saber: você ainda pensa em cuidar de {{objetivo}} ou mudou de ideia? Sem pressão, só curiosidade mesmo.',
    descricao: 'D+60 + leveza + sem pressão + abertura honesta'
  },

  D90_ULTIMA_TENTATIVA: {
    key: 'D90_ULTIMA_TENTATIVA',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'reativacao',
    template: '{{nome}}, última mensagem minha. Já faz 3 meses. Se ainda tiver interesse em {{objetivo}}, me chama. Se não, vou tirar você da lista pra não incomodar. Combinado?',
    descricao: 'D+90 + respeito + ultimato gentil + opt-out claro'
  },

  D180_ANIVERSARIO_LEAD: {
    key: 'D180_ANIVERSARIO_LEAD',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'reativacao',
    template: '{{nome}}, faz 6 meses que você entrou em contato. Muita coisa mudou? Caso {{objetivo}} ainda seja relevante, tenho condições especiais pra quem retorna. Vamos conversar?',
    descricao: 'D+180 + marco temporal + incentivo especial + abertura'
  },

  // ========================================
  // OBJEÇÕES - PREÇO (15 variações)
  // ========================================
  OBJECAO_PRECO_01: {
    key: 'OBJECAO_PRECO_01',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'objecao',
    template: 'Entendo, {{nome}}. Preço é sempre uma questão. Mas deixa eu te perguntar: quanto você já gastou em coisas que não funcionaram? Aqui é protocolo científico, não tentativa e erro. Vale cada centavo.',
    descricao: 'Validação + reframe (custo de oportunidade) + credibilidade'
  },

  OBJECAO_PRECO_02: {
    key: 'OBJECAO_PRECO_02',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'objecao',
    template: '{{nome}}, caro é continuar sem resolver. Barato é investir uma vez e resolver de verdade. A gente tem parcelamento em até 6x sem juros. Quer saber como funciona?',
    descricao: 'Reframe (valor vs custo) + solução financeira + call to action'
  },

  OBJECAO_PRECO_03: {
    key: 'OBJECAO_PRECO_03',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'objecao',
    template: 'Olha, se fosse barato, todo mundo teria resultado. Eu não faço promoção de resultado. Faço resultado com método. E cobro pelo valor que entrego. Faz sentido pra você?',
    descricao: 'Autoridade + posicionamento premium + qualificação'
  },

  OBJECAO_PRECO_04: {
    key: 'OBJECAO_PRECO_04',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'objecao',
    template: '{{nome}}, entendo. Mas me responde: quanto vale resolver {{objetivo}} de uma vez? Porque aqui você paga uma vez e resolve. Não fica tentando de novo e de novo.',
    descricao: 'Empatia + reframe valor vitalício + solução definitiva'
  },

  OBJECAO_PRECO_05: {
    key: 'OBJECAO_PRECO_05',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'objecao',
    template: 'Preço alto? Comparado a quê? Produto barato, serviço mediano, resultado zero? Prefiro cobrar justo e entregar tudo. Você merece o melhor, não o mais barato.',
    descricao: 'Confronto (comparação) + valor > preço + empoderamento'
  },

  // ========================================
  // OBJEÇÕES - TEMPO (10 variações)
  // ========================================
  OBJECAO_TEMPO_01: {
    key: 'OBJECAO_TEMPO_01',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'objecao',
    template: '{{nome}}, todo mundo tá sem tempo. Mas quem espera "sobrar tempo" nunca começa. A sessão dura 40 minutos. Você tem 40 minutos por semana pra investir em você?',
    descricao: 'Validação + reframe (priorização) + especificidade'
  },

  OBJECAO_TEMPO_02: {
    key: 'OBJECAO_TEMPO_02',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'objecao',
    template: 'Entendo. Mas vou te falar: tempo a gente não acha, a gente decide. Te ofereço horário às 7h ou às 20h. Um dos dois funciona?',
    descricao: 'Firmeza empática + oferta de extremos (manhã cedo/noite)'
  },

  OBJECAO_TEMPO_03: {
    key: 'OBJECAO_TEMPO_03',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'objecao',
    template: '{{nome}}, você tem tempo pra rolar feed, tem tempo pra pensar no problema. Mas não tem 40min por semana pra resolver? Bora reorganizar prioridades. Sábado de manhã funciona?',
    descricao: 'Confronto produtivo + reframe priorização + oferta alternativa'
  },

  OBJECAO_TEMPO_04: {
    key: 'OBJECAO_TEMPO_04',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'objecao',
    template: 'Sem tempo = sem prioridade. Eu entendo. Mas quando {{objetivo}} virar prioridade, me chama. Vou estar aqui.',
    descricao: 'Verdade dura + respeito + abertura futura'
  },

  // ========================================
  // CONFIRMAÇÃO DE AGENDAMENTO (10 variações)
  // ========================================
  CONFIRMACAO_24H: {
    key: 'CONFIRMACAO_24H',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'agenda',
    template: 'Oi {{nome}}! Lembrando que amanhã ({{data}}) às {{hora}} você tem sessão de {{procedimento}} aqui na {{clinica}}. Confirma pra mim? 💜 Qualquer imprevisto, me avisa com antecedência 🙏',
    descricao: 'Lembrete 24h antes + confirmação + regra de cancelamento'
  },

  CONFIRMACAO_2H: {
    key: 'CONFIRMACAO_2H',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'agenda',
    template: '{{nome}}, daqui 2h! {{hora}} - {{procedimento}}. Já tô esperando você. Endereço: {{maps}}. Qualquer coisa, me chama!',
    descricao: 'Lembrete 2h antes + entusiasmo + praticidade (mapa)'
  },

  CONFIRMACAO_1H: {
    key: 'CONFIRMACAO_1H',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'agenda',
    template: '{{nome}}, 1 hora! Já estamos preparando tudo pra você. {{hora}} - {{procedimento}}. Te espero! 🌸',
    descricao: 'Lembrete 1h + preparação antecipada + acolhimento'
  },

  CONFIRMACAO_SEMANA: {
    key: 'CONFIRMACAO_SEMANA',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'agenda',
    template: 'Oi {{nome}}! Só pra confirmar: {{data}} ({{diaSemana}}) às {{hora}} - {{procedimento}}. Tá tudo ok? Qualquer mudança, me avisa com 24h de antecedência. Combinado?',
    descricao: 'Lembrete semanal + detalhes completos + regra de cancelamento'
  },

  // ========================================
  // PÓS-VENDA E FIDELIZAÇÃO (20 variações)
  // ========================================
  POS_VENDA_AGRADECIMENTO: {
    key: 'POS_VENDA_AGRADECIMENTO',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, obrigada por confiar em mim hoje! Espero que tenha se sentido acolhida. Qualquer dúvida sobre os cuidados pós-sessão, estou aqui. Próxima sessão: {{data}} às {{hora}}. Já tá agendada! 🌸',
    descricao: 'Gratidão + cuidado + próximo passo (commitment)'
  },

  POS_VENDA_AVALIACAO: {
    key: 'POS_VENDA_AVALIACAO',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Oi {{nome}}! Me ajuda com algo rápido? Deixa sua avaliação sobre a sessão de {{procedimento}}. É importante pra mim e pra outras mulheres decidirem também. Link: {{review}} ⭐️',
    descricao: 'Pedido de avaliação humanizado + social proof + facilidade'
  },

  POS_VENDA_INDICACAO: {
    key: 'POS_VENDA_INDICACAO',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: '{{nome}}, você ficou feliz com o resultado de {{procedimento}}? 😍 Indica pra uma amiga que também quer se cuidar! Se ela marcar e citar seu nome, você ganha 20% de desconto na próxima sessão. Combinado?',
    descricao: 'Reforço positivo + incentivo financeiro + win-win'
  },

  POS_CONSULTA_CUIDADOS: {
    key: 'POS_CONSULTA_CUIDADOS',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Oi {{nome}}! Só lembrando dos cuidados pós-{{procedimento}}: {{instrucoes}}. Qualquer dúvida, estou aqui. Nos vemos {{data}}! 💜',
    descricao: 'Cuidado pós-sessão + instruções + próximo compromisso'
  },

  POS_TRATAMENTO_FOLLOWUP: {
    key: 'POS_TRATAMENTO_FOLLOWUP',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, como você está se sentindo depois de {{procedimento}}? Alguma reação, dúvida ou só felicidade? Me conta! 🌸',
    descricao: 'Check-in pós-tratamento + abertura para feedback'
  },

  POS_VENDA_UPSELL: {
    key: 'POS_VENDA_UPSELL',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: '{{nome}}, agora que você já conhece nosso trabalho em {{procedimento}}, tenho uma sugestão: combinar com {{procedimento2}} potencializa o resultado em 40%. Quer saber mais?',
    descricao: 'Upsell baseado em resultado + estatística + convite'
  },

  // ========================================
  // CAMPANHAS PREMIUM (10 variações)
  // ========================================
  CAMPANHA_BLACK_FRIDAY: {
    key: 'CAMPANHA_BLACK_FRIDAY',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: '{{nome}}, Black Friday Elevare! 🎉 Pacote {{procedimento}} com 30% OFF até domingo. Apenas 10 vagas. Quer garantir a sua?',
    descricao: 'Sazonalidade + scarcity (10 vagas) + deadline (domingo)'
  },

  CAMPANHA_ANO_NOVO: {
    key: 'CAMPANHA_ANO_NOVO',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: '2025 começando, {{nome}}! Que tal começar o ano cuidando de você? Pacote Renove com 3 sessões de {{procedimento}} por {{valor}}. Vagas limitadas. Interesse?',
    descricao: 'Gancho temporal + pacote atrativo + call to action simples'
  },

  CAMPANHA_DIA_MULHER: {
    key: 'CAMPANHA_DIA_MULHER',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: 'Feliz Dia da Mulher, {{nome}}! 💐 Você merece se sentir incrível. Gift especial: {{procedimento}} com desconto VIP até sexta. Quer agendar?',
    descricao: 'Celebração + exclusividade + deadline próximo'
  },

  CAMPANHA_VERAO: {
    key: 'CAMPANHA_VERAO',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: '{{nome}}, verão chegando! ☀️ Que tal se preparar? Pacote Corpo de Verão com {{procedimento}} + {{procedimento2}}. Condição especial até {{data}}. Interesse?',
    descricao: 'Sazonalidade + combo estratégico + deadline'
  },

  CAMPANHA_DIA_MAES: {
    key: 'CAMPANHA_DIA_MAES',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: '{{nome}}, presenteie sua mãe (ou se presenteie!) com autocuidado neste Dia das Mães. Vale-presente especial disponível. Quer saber mais? 💝',
    descricao: 'Ocasião especial + duplo público + vale-presente'
  },

  CAMPANHA_NATAL: {
    key: 'CAMPANHA_NATAL',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: 'Natal chegando, {{nome}}! 🎄 O melhor presente é cuidar de você. Pacote Renovação com 25% OFF até 20/12. Últimas vagas. Garante a sua?',
    descricao: 'Sazonalidade + autovalorização + scarcity + deadline'
  },

  // ========================================
  // REAGENDAMENTO E NO-SHOW (5 variações)
  // ========================================
  NO_SHOW_FOLLOWUP: {
    key: 'NO_SHOW_FOLLOWUP',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'agenda',
    template: '{{nome}}, percebi que você não conseguiu vir hoje. Tudo bem? Acontece. Quer remarcar? Tenho {{data}} às {{hora}} ou {{hora2}}. Me avisa.',
    descricao: 'Tom compreensivo + sem julgamento + facilidade de reagendamento'
  },

  REAGENDAMENTO_SOLICITACAO: {
    key: 'REAGENDAMENTO_SOLICITACAO',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'agenda',
    template: 'Oi {{nome}}, vi que você pediu pra remarcar. Sem problema! Tenho {{data}} às {{hora}} ou {{data2}} às {{hora2}}. Qual prefere?',
    descricao: 'Confirmação + opções claras + baixa fricção'
  },

  NO_SHOW_SEGUNDA_TENTATIVA: {
    key: 'NO_SHOW_SEGUNDA_TENTATIVA',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'agenda',
    template: '{{nome}}, notei que você faltou de novo. Tá tudo bem? Me preocupo quando isso acontece. Se não dá mais pra continuar, sem problema. Mas me conta o que tá rolando.',
    descricao: 'Preocupação genuína + abertura + sem julgamento'
  },

  REAGENDAMENTO_URGENTE: {
    key: 'REAGENDAMENTO_URGENTE',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'agenda',
    template: '{{nome}}, precisei remarcar sua sessão de {{data}} por motivo de força maior. Pode ser {{data2}} às {{hora}} ou {{data3}} às {{hora2}}? Desculpa o transtorno!',
    descricao: 'Comunicação de mudança + transparência + opções alternativas'
  },

  // ========================================
  // MENSAGENS CONTEXTUAIS - UTM/FONTE
  // ========================================
  UTM_GOOGLE_ADS: {
    key: 'UTM_GOOGLE_ADS',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Oi {{nome}}! Vi que você clicou no nosso anúncio do Google sobre {{objetivo}}. Posso te ajudar com informações ou prefere já agendar uma avaliação?',
    descricao: 'Reconhecimento da fonte + ofertas (info ou ação)'
  },

  UTM_FACEBOOK_ADS: {
    key: 'UTM_FACEBOOK_ADS',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, vi que você veio pelo Facebook! 📱 Que bom te ter aqui. Deixa eu te contar rapidinho como funciona {{objetivo}} aqui na {{clinica}}. Topa?',
    descricao: 'Origem Facebook + tom social + convite educativo'
  },

  UTM_INSTAGRAM: {
    key: 'UTM_INSTAGRAM',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Oi {{nome}}! Chegou aqui pelo Instagram? 💜 Que legal! O que te chamou atenção: {{procedimento}}, {{procedimento2}} ou outro tratamento?',
    descricao: 'Origem Instagram + curiosidade + segmentação de interesse'
  },

  INTERESSE_DEPILACAO_LASER: {
    key: 'INTERESSE_DEPILACAO_LASER',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, vi seu interesse em depilação a laser. Trabalho com tecnologia {{tecnologia}} (a mais avançada). Quantas áreas você quer tratar? Já monto um orçamento personalizado.',
    descricao: 'Interesse específico + credencial técnica + personalização'
  },

  INTERESSE_ESTETICA_FACIAL: {
    key: 'INTERESSE_ESTETICA_FACIAL',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Oi {{nome}}! Estética facial, né? Qual a sua preocupação: rugas, manchas, flacidez ou acne? Me conta que eu monto um protocolo sob medida pra você.',
    descricao: 'Segmentação facial + problemas comuns + personalização'
  },

  INTERESSE_ESTETICA_CORPORAL: {
    key: 'INTERESSE_ESTETICA_CORPORAL',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, estética corporal! Você quer trabalhar gordura localizada, celulite, flacidez ou harmonização? Cada uma tem protocolo diferente. Qual é o seu foco?',
    descricao: 'Segmentação corporal + especificidade + educação'
  },

  CLICK_WHATSAPP_DIRETO: {
    key: 'CLICK_WHATSAPP_DIRETO',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, você clicou direto no WhatsApp! Isso mostra que está decidida. 😄 Me fala: quer agendar hoje ou prefere tirar dúvidas primeiro?',
    descricao: 'Reconhecimento de intenção forte + binário (ação/info)'
  },

  LEAD_ORGANICO_SITE: {
    key: 'LEAD_ORGANICO_SITE',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Oi {{nome}}! Você preencheu o formulário no nosso site sobre {{objetivo}}. Qual a melhor forma de te ajudar: ligação, vídeo-chamada ou mensagem mesmo?',
    descricao: 'Lead orgânico + flexibilidade de canal + autonomia'
  },

  INDICACAO_DE_CLIENTE: {
    key: 'INDICACAO_DE_CLIENTE',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: 'Oi {{nome}}! A {{nomeIndicou}} te indicou pra gente. 💜 Isso já diz muito! Você tem prioridade na agenda. Quer marcar pra quando?',
    descricao: 'Indicação (trust elevado) + prioridade + call to action'
  },

  REATIVACAO_CLIENTE_ANTIGO: {
    key: 'REATIVACAO_CLIENTE_ANTIGO',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'reativacao',
    template: '{{nome}}, saudades de você! Faz tempo que não vem. Mudou algo no seu tratamento? Quero saber como você está e se quer retomar. Me conta!',
    descricao: 'Afeto + curiosidade genuína + convite de retorno'
  },

  ANIVERSARIO_CLIENTE: {
    key: 'ANIVERSARIO_CLIENTE',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: 'Feliz aniversário, {{nome}}! 🎉🎂 Você é especial pra gente. Preparei um presente: {{desconto}} de desconto em qualquer procedimento até {{data}}. Aproveita!',
    descricao: 'Aniversário + personalização + presente exclusivo'
  },

  META_MENSAL_CUMPRIDA: {
    key: 'META_MENSAL_CUMPRIDA',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, você cumpriu {{sessoes}} sessões este mês! Parabéns! 🎊 Tá vendo resultado? Me conta como você está se sentindo!',
    descricao: 'Reconhecimento de progresso + celebração + feedback'
  },

  LEMBRETE_RETORNO_PERIODICO: {
    key: 'LEMBRETE_RETORNO_PERIODICO',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'agenda',
    template: 'Oi {{nome}}! Segundo o protocolo de {{procedimento}}, você deve voltar a cada {{intervalo}}. Já faz {{dias}} dias. Bora agendar a manutenção? Tenho {{data}} disponível.',
    descricao: 'Lembrete técnico + periodicidade + facilidade de agendamento'
  },

  OFERTA_FLASH_24H: {
    key: 'OFERTA_FLASH_24H',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: '{{nome}}, FLASH SALE! ⚡ Próximas 24h: {{procedimento}} com {{desconto}}. Apenas 5 vagas. Responde "QUERO" e eu reservo a sua. Corre!',
    descricao: 'Urgência extrema (24h) + scarcity (5 vagas) + CTA simples'
  },

  PACOTE_COMBO_ESPECIAL: {
    key: 'PACOTE_COMBO_ESPECIAL',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: '{{nome}}, montei um combo especial pra você: {{procedimento}} + {{procedimento2}} + {{procedimento3}} por {{valor}} ({{desconto}} de economia). Oferta exclusiva até {{data}}. Interesse?',
    descricao: 'Personalização + combo estratégico + economia destacada'
  },

  FEEDBACK_POS_5_SESSOES: {
    key: 'FEEDBACK_POS_5_SESSOES',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, você completou 5 sessões de {{procedimento}}! 🎉 Como está o resultado? Já nota diferença? Sua opinião é importante pra ajustar o protocolo.',
    descricao: 'Marco de progresso + pedido de feedback + ajuste contínuo'
  },

  FERIAS_CLINICA: {
    key: 'FERIAS_CLINICA',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'agenda',
    template: 'Oi {{nome}}! Aviso importante: estaremos de férias de {{dataInicio}} a {{dataFim}}. Quer agendar antes ou prefere logo depois? Agenda abrindo rápido!',
    descricao: 'Comunicação de fechamento + opções antes/depois + scarcity'
  },

  HORARIO_ESPECIAL_FERIADO: {
    key: 'HORARIO_ESPECIAL_FERIADO',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'agenda',
    template: '{{nome}}, no feriado de {{feriado}} vamos funcionar em horário especial: {{horarios}}. Quer aproveitar pra adiantar sua sessão? Poucos horários disponíveis.',
    descricao: 'Comunicação de exceção + oportunidade + scarcity'
  },

  PRIMEIRA_COMPRA_DESCONTO: {
    key: 'PRIMEIRA_COMPRA_DESCONTO',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: '{{nome}}, como é sua primeira vez aqui na {{clinica}}, preparei um presente: {{desconto}} no pacote inicial de {{procedimento}}. Válido só na primeira compra. Quer garantir?',
    descricao: 'First-time offer + exclusividade + call to action'
  },

  UPGRADE_PREMIUM: {
    key: 'UPGRADE_PREMIUM',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: '{{nome}}, você é cliente especial. Quero te oferecer upgrade pro pacote Premium com {{beneficios}}. Diferença de apenas {{valor}}. Vale muito a pena. Topa?',
    descricao: 'Reconhecimento de fidelidade + upsell premium + valor agregado'
  },

  CLIENTE_VIP_CONVITE: {
    key: 'CLIENTE_VIP_CONVITE',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: '{{nome}}, você foi selecionada pro nosso Programa VIP! 👑 Benefícios: prioridade na agenda, descontos exclusivos e brinde mensal. Quer fazer parte? Responde "SIM".',
    descricao: 'Exclusividade máxima + benefícios múltiplos + simplicidade'
  },

  PESQUISA_SATISFACAO: {
    key: 'PESQUISA_SATISFACAO',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Oi {{nome}}! Poderia avaliar nosso atendimento de 0 a 10? Sua opinião ajuda muito. É rápido: responde só um número. Obrigada! 💜',
    descricao: 'NPS simples + baixa fricção (só um número) + gratidão'
  },

  LEAD_TEMPO_SITE: {
    key: 'LEAD_TEMPO_SITE',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, percebi que você passou {{minutos}} minutos no nosso site! Ficou alguma dúvida? Posso te ajudar com informações sobre {{objetivo}}?',
    descricao: 'Behavioral trigger (tempo site) + proatividade + ajuda'
  },

  LEAD_SCROLL_PROFUNDO: {
    key: 'LEAD_SCROLL_PROFUNDO',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Vi que você explorou bastante nossa página de {{procedimento}}! Gostou do que viu? Quer conversar mais sobre ou prefere agendar direto?',
    descricao: 'Behavioral trigger (scroll) + engajamento + binário'
  },

  LEAD_VIDEO_COMPLETO: {
    key: 'LEAD_VIDEO_COMPLETO',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, você assistiu o vídeo completo de {{procedimento}}! Isso mostra interesse real. 😊 Quer tirar dúvidas ou já marcar uma avaliação?',
    descricao: 'Behavioral trigger (vídeo) + reconhecimento + call to action'
  },

  LEAD_GCLID: {
    key: 'LEAD_GCLID',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: 'Oi {{nome}}! Vi que você clicou no nosso anúncio do Google. Posso te enviar mais informações sobre {{objetivo}} ou prefere já agendar uma conversa?',
    descricao: 'Fonte Google Ads + opções (info/ação) + flexibilidade'
  },

  LEAD_FBCLID: {
    key: 'LEAD_FBCLID',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, que bom ter você aqui vindo do Facebook! 💙 Me conta: qual o tratamento que mais te interessou?',
    descricao: 'Fonte Facebook + tom social + pergunta de segmentação'
  },

  CARRINHO_ABANDONADO: {
    key: 'CARRINHO_ABANDONADO',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: '{{nome}}, notei que você começou a agendar {{procedimento}} mas não finalizou. Rolou alguma dúvida? Posso te ajudar a completar. Ou prefere que eu finalize pra você?',
    descricao: 'Abandono carrinho + proatividade + baixa fricção'
  },

  PESQUISA_INTERESSE_FUTURO: {
    key: 'PESQUISA_INTERESSE_FUTURO',
    stage: 'frio',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, me ajuda com uma pergunta rápida: se pudesse fazer qualquer tratamento aqui na {{clinica}}, qual seria? Só curiosidade mesmo. 😊',
    descricao: 'Engajamento leve + descoberta de interesse + leveza'
  },

  CONVITE_EVENTO_EXCLUSIVO: {
    key: 'CONVITE_EVENTO_EXCLUSIVO',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: '{{nome}}, você está convidada pro nosso evento exclusivo: {{nomeEvento}} dia {{data}}! Demonstrações ao vivo, brindes e condições especiais. Confirma presença?',
    descricao: 'Evento presencial + exclusividade + benefícios múltiplos'
  },

  NOVA_TECNOLOGIA_LANCAMENTO: {
    key: 'NOVA_TECNOLOGIA_LANCAMENTO',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: '{{nome}}, NOVIDADE! Acabamos de trazer {{tecnologia}} — a mais avançada do mercado pra {{objetivo}}. Quer ser uma das primeiras a testar? Condição de lançamento especial.',
    descricao: 'Inovação + early adopter + exclusividade'
  },

  RESULTADO_ANTES_DEPOIS: {
    key: 'RESULTADO_ANTES_DEPOIS',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, posso te mostrar resultados reais de {{procedimento}}? Tenho fotos antes/depois de casos parecidos com o seu. Quer ver?',
    descricao: 'Prova visual + personalização (casos similares) + convite'
  },

  GARANTIA_SATISFACAO: {
    key: 'GARANTIA_SATISFACAO',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: '{{nome}}, trabalhamos com garantia de satisfação em {{procedimento}}. Se não gostar do resultado após {{sessoes}} sessões, devolvemos seu investimento. É esse o nível de confiança que temos. Vem?',
    descricao: 'Garantia bold + remoção de risco + autoridade técnica'
  },

  PROTOCOLO_PERSONALIZADO: {
    key: 'PROTOCOLO_PERSONALIZADO',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: '{{nome}}, cada cliente é única. Por isso montamos protocolo 100% personalizado baseado em {{variaveis}}. Não fazemos "pacote padrão". Quer sua avaliação customizada? Agende.',
    descricao: 'Personalização extrema + posicionamento premium + CTA'
  },

  CIENCIA_COMPROVADA: {
    key: 'CIENCIA_COMPROVADA',
    stage: 'quente',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'autoridade',
    template: '{{nome}}, tudo que fazemos é baseado em ciência. {{procedimento}} tem {{estudos}} estudos comprovando eficácia de {{percentual}}. Não é achismo, é evidência. Quer conhecer o protocolo?',
    descricao: 'Credibilidade científica + estatísticas + convite técnico'
  },

  DEPOIMENTO_CLIENTE_SIMILAR: {
    key: 'DEPOIMENTO_CLIENTE_SIMILAR',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'boasvindas',
    template: '{{nome}}, uma cliente com caso parecido com o seu disse: "{{depoimento}}". Isso faz sentido pra você? Quer conversar sobre como podemos te ajudar também?',
    descricao: 'Social proof direcionado + empatia + convite'
  },

  PARCERIA_ESPECIAL: {
    key: 'PARCERIA_ESPECIAL',
    stage: 'morno',
    canal: 'whatsapp',
    ativo: true,
    categoria: 'campanha',
    template: '{{nome}}, temos parceria com {{empresa}} e você tem desconto especial como {{vinculo}}! {{desconto}} em {{procedimento}}. Quer aproveitar? Válido até {{data}}.',
    descricao: 'Parceria corporativa + benefício exclusivo + deadline'
  },

};

/**
 * Retorna todas as mensagens ativas de um stage específico
 */
export function getMensagensPorStage(stage: 'frio' | 'morno' | 'quente'): MensagemTemplate[] {
  return Object.values(BIBLIOTECA_MENSAGENS).filter(
    msg => msg.ativo && msg.stage === stage
  );
}

/**
 * Retorna todas as mensagens ativas de uma categoria
 */
export function getMensagensPorCategoria(categoria: string): MensagemTemplate[] {
  return Object.values(BIBLIOTECA_MENSAGENS).filter(
    msg => msg.ativo && msg.categoria === categoria
  );
}

/**
 * Busca mensagem por key
 */
export function getMensagemByKey(key: string): MensagemTemplate | undefined {
  return BIBLIOTECA_MENSAGENS[key];
}

/**
 * Retorna contagem de mensagens por categoria
 */
export function getEstatisticasBiblioteca(): Record<string, number> {
  const stats: Record<string, number> = {};
  
  Object.values(BIBLIOTECA_MENSAGENS).forEach(msg => {
    if (msg.categoria) {
      stats[msg.categoria] = (stats[msg.categoria] || 0) + 1;
    }
  });
  
  return stats;
}

/**
 * Total de mensagens na biblioteca
 */
export const TOTAL_MENSAGENS = Object.keys(BIBLIOTECA_MENSAGENS).length;

