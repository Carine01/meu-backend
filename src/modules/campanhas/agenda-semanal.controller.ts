import { Controller, Post, Get, Query } from '@nestjs/common';
import { AgendaSemanalService } from './agenda-semanal.service';

@Controller('campanhas')
export class AgendaSemanalController {
  constructor(private readonly agendaSemanalService: AgendaSemanalService) {}

  @Post('executar-agenda')
  async executarAgenda(@Query('dia') dia?: string) {
    return this.agendaSemanalService.executarAgendaDoDia();
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

