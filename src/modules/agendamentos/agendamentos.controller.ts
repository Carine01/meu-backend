import { Controller, Get, Post, Put, Body, Param, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { BloqueiosService } from './bloqueios.service';
import { Agendamento } from './entities/agendamento.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('agendamentos')
@UseGuards(JwtAuthGuard)
export class AgendamentosController {
  constructor(
    private readonly agendamentosService: AgendamentosService,
    private readonly bloqueiosService: BloqueiosService,
  ) {}

  @Post()
  async criar(@Body() dados: Partial<Agendamento>): Promise<Agendamento> {
    // Verificar bloqueios antes de criar
    if (dados.startISO && dados.duracaoMinutos) {
      const data = new Date(dados.startISO);
      const hora = data.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      const verificacao = await this.bloqueiosService.isHorarioBloqueado(
        dados.clinicId || 'default',
        dados.startISO,
        hora,
        dados.duracaoMinutos,
      );

      if (verificacao.bloqueado) {
        throw new BadRequestException(`Horário bloqueado: ${verificacao.motivo}`);
      }
    }

    return this.agendamentosService.criarAgendamento(dados);
  }

  @Put(':id/confirmar')
  async confirmar(@Param('id') id: string): Promise<void> {
    return this.agendamentosService.confirmarAgendamento(id);
  }

  @Put(':id/cancelar')
  async cancelar(
    @Param('id') id: string,
    @Body('motivo') motivo?: string,
  ): Promise<void> {
    return this.agendamentosService.cancelarAgendamento(id, motivo);
  }

  @Put(':id/compareceu')
  async marcarComparecimento(@Param('id') id: string): Promise<void> {
    return this.agendamentosService.marcarComparecimento(id);
  }

  @Put(':id/no-show')
  async marcarNoShow(@Param('id') id: string): Promise<void> {
    return this.agendamentosService.marcarNoShow(id);
  }

  @Put(':id/reagendar')
  async reagendar(
    @Param('id') id: string,
    @Body('novoStartISO') novoStartISO: string,
  ): Promise<void> {
    return this.agendamentosService.reagendar(id, novoStartISO);
  }

  // ========== ENDPOINTS DE BLOQUEIOS ==========

  /**
   * GET /agendamentos/sugerir/:clinicId
   * Sugerir horários livres
   */
  @Get('sugerir/:clinicId')
  async sugerirHorarios(
    @Param('clinicId') clinicId: string,
    @Query('data') data: string,
    @Query('duracao') duracao: string,
  ) {
    return this.bloqueiosService.sugerirHorarioLivre(
      clinicId,
      data,
      parseInt(duracao, 10),
    );
  }

  /**
   * POST /agendamentos/bloqueios/almoco/:clinicId
   * Bloquear horário de almoço
   */
  @Post('bloqueios/almoco/:clinicId')
  async bloquearAlmoco(@Param('clinicId') clinicId: string) {
    await this.bloqueiosService.bloquearAlmoco(clinicId);
    return { mensagem: 'Horários de almoço bloqueados com sucesso' };
  }

  /**
   * POST /agendamentos/bloqueios/sabados/:clinicId
   * Bloquear sábados após 14h
   */
  @Post('bloqueios/sabados/:clinicId')
  async bloquearSabados(@Param('clinicId') clinicId: string) {
    await this.bloqueiosService.bloquearSabados(clinicId);
    return { mensagem: 'Sábados bloqueados após 14h' };
  }

  /**
   * POST /agendamentos/bloqueios/feriados/:clinicId
   * Bloquear feriados nacionais
   */
  @Post('bloqueios/feriados/:clinicId')
  async bloquearFeriados(@Param('clinicId') clinicId: string) {
    await this.bloqueiosService.bloquearFeriados(clinicId);
    return { mensagem: 'Feriados nacionais bloqueados' };
  }

  /**
   * GET /agendamentos/bloqueios/verificar/:clinicId
   * Verificar se horário está bloqueado
   */
  @Get('bloqueios/verificar/:clinicId')
  async verificarBloqueio(
    @Param('clinicId') clinicId: string,
    @Query('data') data: string,
    @Query('hora') hora: string,
    @Query('duracao') duracao: string,
  ) {
    return this.bloqueiosService.isHorarioBloqueado(
      clinicId,
      data,
      hora,
      parseInt(duracao, 10),
    );
  }

  /**
   * GET /agendamentos/bloqueios/:clinicId
   * Listar todos os bloqueios
   */
  @Get('bloqueios/:clinicId')
  async listarBloqueios(@Param('clinicId') clinicId: string) {
    return this.bloqueiosService.listarBloqueios(clinicId);
  }
}


