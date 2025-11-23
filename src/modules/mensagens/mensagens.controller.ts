import { Controller, Get, Headers } from '@nestjs/common';
import { MensagensService } from './mensagens.service';

/**
 * Controller de Mensagens
 * Endpoints para gestão de mensagens com suporte a multitenancy
 */
@Controller('mensagens')
export class MensagensController {
  constructor(private readonly service: MensagensService) {}

  /**
   * GET /mensagens
   * Busca mensagens da clínica identificada no header x-clinic-id
   * 
   * @param clinicId - ID da clínica vindo do header x-clinic-id
   * @returns Array de mensagens da clínica
   */
  @Get()
  async findAll(@Headers('x-clinic-id') clinicId: string) {
    return this.service.findAllByClinic(clinicId);
  }
}
