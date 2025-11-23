import { Controller, Get, Headers, BadRequestException } from '@nestjs/common';
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
   * @throws BadRequestException se clinicId não for fornecido
   */
  @Get()
  async findAll(@Headers('x-clinic-id') clinicId: string) {
    const trimmedClinicId = clinicId?.trim();
    if (!trimmedClinicId) {
      throw new BadRequestException('Header x-clinic-id é obrigatório');
    }
    return this.service.findAllByClinic(trimmedClinicId);
  }
}
