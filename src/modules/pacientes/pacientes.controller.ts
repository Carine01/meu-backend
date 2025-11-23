import { Controller, Get, Headers } from '@nestjs/common';
import { PacientesService } from './pacientes.service';

@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Get()
  async findAll(@Headers('x-clinic-id') clinicId: string) {
    return this.pacientesService.findAllByClinic(clinicId);
  }
}
