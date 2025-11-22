import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: 10000,
});

// Indicações
export const indicacoesApi = {
  // Enviar nova indicação
  enviarIndicacao: (indicadorId: string, dados: { nome: string; telefone: string; email?: string }) =>
    api.post('/indicacoes', { indicadorId, ...dados }),

  // Listar indicações do usuário
  getIndicacoes: (leadId: string) =>
    api.get(`/indicacoes/${leadId}`),

  // Ver recompensa
  getRecompensa: (leadId: string) =>
    api.get(`/indicacoes/recompensa/${leadId}`),

  // Resgatar sessão grátis
  resgatarSessao: (leadId: string) =>
    api.post(`/indicacoes/resgatar/${leadId}`),

  // Atualizar status do indicado
  indicadoAgendou: (indicacaoId: string, agendamentoId: string) =>
    api.put(`/indicacoes/agendou/${indicacaoId}`, { agendamentoId }),

  indicadoCompareceu: (indicacaoId: string) =>
    api.put(`/indicacoes/compareceu/${indicacaoId}`),
};

// Leads
export const leadsApi = {
  getLeadByTelefone: (telefone: string) =>
    api.get(`/leads/by-telefone/${telefone}`),
  
  getLeadById: (leadId: string) =>
    api.get(`/leads/${leadId}`),
};

// Agendamentos
export const agendamentosApi = {
  criarAgendamento: (dados: any) =>
    api.post('/agendamentos', dados),
};
