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
   * @throws BadRequestException se clinicId não for fornecido ou inválido
   */
  @Get()
  async findAll(@Headers('x-clinic-id') clinicId: string) {
    const trimmedClinicId = clinicId?.trim();
    if (!trimmedClinicId) {
      throw new BadRequestException('Header x-clinic-id é obrigatório');
    }
    
    // Validar formato do clinicId: alphanumeric, underscore, hyphen (min 1, max 50 chars)
    const validClinicIdPattern = /^[a-zA-Z0-9_-]{1,50}$/;
    if (!validClinicIdPattern.test(trimmedClinicId)) {
      throw new BadRequestException('Header x-clinic-id possui formato inválido. Use apenas letras, números, underscore e hífen (máx 50 caracteres)');
    }
    
    return this.service.findAllByClinic(trimmedClinicId);
  }
}
