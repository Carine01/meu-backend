import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paciente } from './entities/paciente.entity';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private readonly repo: Repository<Paciente>,
  ) {}

  async findAllByClinic(clinicId: string) {
    if (!clinicId || clinicId.trim() === '') {
      throw new BadRequestException('clinicId is required');
    }
    return this.repo.find({ where: { clinicId } });
  }
}
