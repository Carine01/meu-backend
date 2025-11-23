import { Controller, Get, Post, Put, Body, Param, Query, BadRequestException, UseGuards, Req } from '@nestjs/common';
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
  async criar(@Body() dados: Partial<Agendamento>, @Req() req: any): Promise<Agendamento> {
    const clinicId = req.user.clinicId;
    
    // Verificar bloqueios antes de criar
    if (dados.startISO && dados.duracaoMinutos) {
      const data = new Date(dados.startISO);
      const hora = data.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      const verificacao = await this.bloqueiosService.isHorarioBloqueado(
        clinicId,
        dados.startISO,
        hora,
        dados.duracaoMinutos,
      );

      if (verificacao.bloqueado) {
        throw new BadRequestException(`Horário bloqueado: ${verificacao.motivo}`);
      }
    }

    // Garantir que o clinicId seja usado
    const dadosComClinic = { ...dados, clinicId };
    return this.agendamentosService.criarAgendamento(dadosComClinic);
  }

  @Put(':id/confirmar')
  async confirmar(@Param('id') id: string, @Req() req: any): Promise<void> {
    const clinicId = req.user.clinicId;
    return this.agendamentosService.confirmarAgendamento(id, clinicId);
  }

  @Put(':id/cancelar')
  async cancelar(
    @Param('id') id: string,
    @Body('motivo') motivo: string | undefined,
    @Req() req: any,
  ): Promise<void> {
    const clinicId = req.user.clinicId;
    return this.agendamentosService.cancelarAgendamento(id, clinicId, motivo);
  }

  @Put(':id/compareceu')
  async marcarComparecimento(@Param('id') id: string, @Req() req: any): Promise<void> {
    const clinicId = req.user.clinicId;
    return this.agendamentosService.marcarComparecimento(id, clinicId);
  }

  @Put(':id/no-show')
  async marcarNoShow(@Param('id') id: string, @Req() req: any): Promise<void> {
    const clinicId = req.user.clinicId;
    return this.agendamentosService.marcarNoShow(id, clinicId);
  }

  @Put(':id/reagendar')
  async reagendar(
    @Param('id') id: string,
    @Body('novoStartISO') novoStartISO: string,
    @Req() req: any,
  ): Promise<void> {
    const clinicId = req.user.clinicId;
    return this.agendamentosService.reagendar(id, novoStartISO, clinicId);
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
    @Req() req: any,
  ) {
    // Validar que o usuário pode acessar esta clínica
    if (clinicId !== req.user.clinicId) {
      throw new BadRequestException('Você não tem acesso a esta clínica');
    }
    
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
  async bloquearAlmoco(@Param('clinicId') clinicId: string, @Req() req: any) {
    // Validar que o usuário pode acessar esta clínica
    if (clinicId !== req.user.clinicId) {
      throw new BadRequestException('Você não tem acesso a esta clínica');
    }
    
    await this.bloqueiosService.bloquearAlmoco(clinicId);
    return { mensagem: 'Horários de almoço bloqueados com sucesso' };
  }

  /**
   * POST /agendamentos/bloqueios/sabados/:clinicId
   * Bloquear sábados após 14h
   */
  @Post('bloqueios/sabados/:clinicId')
  async bloquearSabados(@Param('clinicId') clinicId: string, @Req() req: any) {
    // Validar que o usuário pode acessar esta clínica
    if (clinicId !== req.user.clinicId) {
      throw new BadRequestException('Você não tem acesso a esta clínica');
    }
    
    await this.bloqueiosService.bloquearSabados(clinicId);
    return { mensagem: 'Sábados bloqueados após 14h' };
  }

  /**
   * POST /agendamentos/bloqueios/feriados/:clinicId
   * Bloquear feriados nacionais
   */
  @Post('bloqueios/feriados/:clinicId')
  async bloquearFeriados(@Param('clinicId') clinicId: string, @Req() req: any) {
    // Validar que o usuário pode acessar esta clínica
    if (clinicId !== req.user.clinicId) {
      throw new BadRequestException('Você não tem acesso a esta clínica');
    }
    
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
    @Req() req: any,
  ) {
    // Validar que o usuário pode acessar esta clínica
    if (clinicId !== req.user.clinicId) {
      throw new BadRequestException('Você não tem acesso a esta clínica');
    }
    
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
  async listarBloqueios(@Param('clinicId') clinicId: string, @Req() req: any) {
    // Validar que o usuário pode acessar esta clínica
    if (clinicId !== req.user.clinicId) {
      throw new BadRequestException('Você não tem acesso a esta clínica');
    }
    
    return this.bloqueiosService.listarBloqueios(clinicId);
  }
}


