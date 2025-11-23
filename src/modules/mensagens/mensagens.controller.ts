import { Controller, Get, Headers, BadRequestException } from '@nestjs/common';
import { MensagensService } from './mensagens.service';

/**
 * Messages Controller
 * Endpoints for messages management with multitenancy support
 */
@Controller('mensagens')
export class MensagensController {
  constructor(private readonly service: MensagensService) {}

  /**
   * GET /mensagens
   * Retrieves messages from clinic identified in x-clinic-id header
   * 
   * @param clinicId - Clinic ID from x-clinic-id header
   * @returns Array of clinic messages
   * @throws BadRequestException if clinicId is not provided or invalid
   */
  @Get()
  async findAll(@Headers('x-clinic-id') clinicId: string) {
    const trimmedClinicId = clinicId?.trim();
    if (!trimmedClinicId) {
      throw new BadRequestException('Header x-clinic-id is required');
    }
    
    // Validate clinicId format: alphanumeric, underscore, hyphen (min 1, max 50 chars)
    const validClinicIdPattern = /^[a-zA-Z0-9_-]{1,50}$/;
    if (!validClinicIdPattern.test(trimmedClinicId)) {
      throw new BadRequestException('Header x-clinic-id has invalid format. Use only letters, numbers, underscore and hyphen (max 50 characters)');
    }
    
    return this.service.findAllByClinic(trimmedClinicId);
  }
}
