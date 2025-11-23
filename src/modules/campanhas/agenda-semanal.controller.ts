import { Controller, Post, Get, Query, Headers } from '@nestjs/common';
import { AgendaSemanalService } from './agenda-semanal.service';

@Controller('campanhas')
export class AgendaSemanalController {
  constructor(private readonly agendaSemanalService: AgendaSemanalService) {}

  @Post('executar-agenda')
  async executarAgenda(
    @Headers('x-clinic-id') clinicId: string,
    @Query('dia') dia?: string,
  ) {
    return this.agendaSemanalService.executarAgendaDoDia(clinicId);
  }

  @Get('regras-semanais')
  async getRegrasSemanais() {
    const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const regras: any = {};
    
    for (const dia of dias) {
      regras[dia] = await this.agendaSemanalService['getRegrasSemanais']()[dia];
    }
    
    return regras;
  }
}

