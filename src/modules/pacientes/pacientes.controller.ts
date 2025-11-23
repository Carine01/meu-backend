import { Controller, Get, Headers, BadRequestException } from '@nestjs/common';
import { PacientesService } from './pacientes.service';

@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Get()
  async findAll(@Headers('x-clinic-id') clinicId: string) {
    if (!clinicId) {
      throw new BadRequestException('x-clinic-id header is required');
    }
    return this.pacientesService.findAllByClinic(clinicId);
  }
}
