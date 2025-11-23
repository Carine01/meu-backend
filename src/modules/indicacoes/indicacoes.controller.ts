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
   * POST /indicacoes
   * Criar nova indicação
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
   * POST /indicacoes/resgatar/:leadId
   * Resgatar sessão grátis
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

