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
   * POST /indicacoes
   * Criar nova indicação
   */
  @Post()
  async criarIndicacao(
    @Body() dados: { indicadorId: string; nome: string; telefone: string; email?: string },
    @Req() req: any,
  ): Promise<{ indicacao: Indicacao; recompensa: Recompensa }> {
    const clinicId = req.user.clinicId;
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
    const clinicId = req.user.clinicId;
    return this.indicacoesService.getIndicacoes(leadId, clinicId);
  }

  /**
   * GET /indicacoes/recompensa/:leadId
   * Ver recompensa/gamificação
   */
  @Get('recompensa/:leadId')
  async verRecompensa(@Param('leadId') leadId: string, @Req() req: any): Promise<Recompensa> {
    const clinicId = req.user.clinicId;
    return this.indicacoesService.getRecompensa(leadId, clinicId);
  }

  /**
   * POST /indicacoes/resgatar/:leadId
   * Resgatar sessão grátis
   */
  @Post('resgatar/:leadId')
  async resgatarSessao(
    @Param('leadId') leadId: string,
    @Req() req: any,
  ): Promise<{ sucesso: boolean; mensagem: string }> {
    const clinicId = req.user.clinicId;
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
    const clinicId = req.user.clinicId;
    return this.indicacoesService.indicadoAgendou(indicacaoId, agendamentoId, clinicId);
  }

  /**
   * PUT /indicacoes/compareceu/:indicacaoId
   * Marcar que indicado compareceu
   */
  @Put('compareceu/:indicacaoId')
  async indicadoCompareceu(@Param('indicacaoId') indicacaoId: string, @Req() req: any): Promise<void> {
    const clinicId = req.user.clinicId;
    return this.indicacoesService.indicadoCompareceu(indicacaoId, clinicId);
  }
}

