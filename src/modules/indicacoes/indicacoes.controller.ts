import { Controller, Post, Get, Param, Body, Put, UseGuards, Req } from '@nestjs/common';
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
    @Req() req: any,
  ): Promise<{ indicacao: Indicacao; recompensa: Recompensa }> {
    const clinicId = req.user?.clinicId || 'ELEVARE_MAIN';
    return this.indicacoesService.registrarIndicacao(dados.indicadorId, clinicId, {
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
  async listarIndicacoes(@Param('leadId') leadId: string, @Req() req: any): Promise<Indicacao[]> {
    const clinicId = req.user?.clinicId || 'ELEVARE_MAIN';
    return this.indicacoesService.getIndicacoes(leadId, clinicId);
  }

  /**
   * GET /indicacoes/recompensa/:leadId
   * Ver recompensa/gamificação
   */
  @Get('recompensa/:leadId')
  async verRecompensa(@Param('leadId') leadId: string, @Req() req: any): Promise<Recompensa> {
    const clinicId = req.user?.clinicId || 'ELEVARE_MAIN';
    return this.indicacoesService.getRecompensa(leadId, clinicId);
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
    @Req() req: any,
  ): Promise<{ sucesso: boolean; mensagem: string }> {
    const clinicId = req.user?.clinicId || 'ELEVARE_MAIN';
    return this.indicacoesService.resgatarSessao(leadId, clinicId);
  }

  /**
   * PUT /indicacoes/agendou/:indicacaoId
   * Marcar que indicado agendou
   */
  @Put('agendou/:indicacaoId')
  async indicadoAgendou(
    @Param('indicacaoId') indicacaoId: string,
    @Body('agendamentoId') agendamentoId: string,
    @Req() req: any,
  ): Promise<void> {
    const clinicId = req.user?.clinicId || 'ELEVARE_MAIN';
    return this.indicacoesService.indicadoAgendou(indicacaoId, clinicId, agendamentoId);
  }

  /**
   * PUT /indicacoes/compareceu/:indicacaoId
   * Marcar que indicado compareceu
   */
  @Put('compareceu/:indicacaoId')
  async indicadoCompareceu(@Param('indicacaoId') indicacaoId: string, @Req() req: any): Promise<void> {
    const clinicId = req.user?.clinicId || 'ELEVARE_MAIN';
    return this.indicacoesService.indicadoCompareceu(indicacaoId, clinicId);
  }
}

