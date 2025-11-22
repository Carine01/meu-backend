import { Controller, Post, Get, Param, Body, Put, UseGuards } from '@nestjs/common';
import { IndicacoesService } from './indicacoes.service';
import { Indicacao } from './entities/indicacao.entity';
import { Recompensa } from './entities/recompensa.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('indicacoes')
@UseGuards(JwtAuthGuard)
export class IndicacoesController {
  constructor(private readonly indicacoesService: IndicacoesService) {}

  /**
   * Registrar nova indicação
   * 
   * Sistema de gamificação:
   * - 1 indicação = 1 ponto
   * - 3 pontos = 1 sessão grátis
   * 
   * @param dados - Dados do indicador e indicado
   * @returns Indicação criada e recompensa atualizada
   * @throws UnauthorizedException se não autenticado
   * 
   * @example
   * POST /indicacoes
   * Authorization: Bearer <token>
   * {
   *   "indicadorId": "lead123",
   *   "nome": "Maria Silva",
   *   "telefone": "+5511999999999",
   *   "email": "maria@email.com"
   * }
   * 
   * Response:
   * {
   *   "indicacao": { ... },
   *   "recompensa": {
   *     "pontosAcumulados": 3,
   *     "sessoesGratisDisponiveis": 1
   *   }
   * }
   */
  @Post()
  async criarIndicacao(
    @Body() dados: { indicadorId: string; nome: string; telefone: string; email?: string },
  ): Promise<{ indicacao: Indicacao; recompensa: Recompensa }> {
    return this.indicacoesService.registrarIndicacao(dados.indicadorId, {
      nome: dados.nome,
      telefone: dados.telefone,
      email: dados.email,
    });
  }

  /**
   * GET /indicacoes/:leadId
   * Listar indicações de um lead
   */
  @Get(':leadId')
  async listarIndicacoes(@Param('leadId') leadId: string): Promise<Indicacao[]> {
    return this.indicacoesService.getIndicacoes(leadId);
  }

  /**
   * GET /indicacoes/recompensa/:leadId
   * Ver recompensa/gamificação
   */
  @Get('recompensa/:leadId')
  async verRecompensa(@Param('leadId') leadId: string): Promise<Recompensa> {
    return this.indicacoesService.getRecompensa(leadId);
  }

  /**
   * Resgatar sessão grátis
   * 
   * Desconta 1 sessão grátis disponível do lead.
   * Requer ter pelo menos 1 sessão disponível.
   * 
   * @param leadId - ID do lead que vai resgatar
   * @returns Confirmação de resgate
   * @throws NotFoundException se lead não tiver sessões disponíveis
   * 
   * @example
   * POST /indicacoes/resgatar/lead123
   * Authorization: Bearer <token>
   * 
   * Response:
   * {
   *   "sucesso": true,
   *   "mensagem": "Sessão grátis resgatada! Você ainda tem 0 sessões disponíveis."
   * }
   */
  @Post('resgatar/:leadId')
  async resgatarSessao(
    @Param('leadId') leadId: string,
  ): Promise<{ sucesso: boolean; mensagem: string }> {
    return this.indicacoesService.resgatarSessao(leadId);
  }

  /**
   * PUT /indicacoes/agendou/:indicacaoId
   * Marcar que indicado agendou
   */
  @Put('agendou/:indicacaoId')
  async indicadoAgendou(
    @Param('indicacaoId') indicacaoId: string,
    @Body('agendamentoId') agendamentoId: string,
  ): Promise<void> {
    return this.indicacoesService.indicadoAgendou(indicacaoId, agendamentoId);
  }

  /**
   * PUT /indicacoes/compareceu/:indicacaoId
   * Marcar que indicado compareceu
   */
  @Put('compareceu/:indicacaoId')
  async indicadoCompareceu(@Param('indicacaoId') indicacaoId: string): Promise<void> {
    return this.indicacoesService.indicadoCompareceu(indicacaoId);
  }
}

