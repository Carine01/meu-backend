import { Controller, Post, Get, Query } from '@nestjs/common';
import { AgendaSemanalService } from './agenda-semanal.service';

@Controller('campanhas')
export class AgendaSemanalController {
  constructor(private readonly agendaSemanalService: AgendaSemanalService) {}

  /**
   * Executar agenda semanal do dia atual
   * 
   * Dispara campanhas automáticas baseadas nas regras do dia da semana.
   * Normalmente chamado por CronJob, mas pode ser manual.
   * 
   * ⚠️ Use com cuidado: Envia mensagens em massa!
   * 
   * @param dia - (Opcional) Forçar dia específico (Segunda, Terça, etc)
   * @returns Confirmação de execução
   * 
   * @example
   * POST /campanhas/executar-agenda
   * 
   * Ou forçar dia específico:
   * POST /campanhas/executar-agenda?dia=Segunda
   */
  @Post('executar-agenda')
  async executarAgenda(@Query('dia') dia?: string) {
    return this.agendaSemanalService.executarAgendaDoDia();
  }

  /**
   * Obter regras semanais de disparo
   * 
   * Lista todas as regras configuradas por dia da semana.
   * Útil para:
   * - Visualizar configurações
   * - Auditoria
   * - Debug
   * 
   * @returns Regras de cada dia da semana
   * 
   * @example
   * GET /campanhas/regras-semanais
   * 
   * Response:
   * {
   *   "Segunda": [
   *     {
   *       "objetivo": "Repescagem de leads frios",
   *       "publicoEtiquetas": ["NovoCliente", "Ocasional"],
   *       "templateKey": "REPESCAGEM_01",
   *       "ativo": true
   *     }
   *   ],
   *   "Terça": [...]
   * }
   */
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

