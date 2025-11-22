import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Campanha } from '../entities/campanha.entity';

@Injectable()
export class CampanhasService {
  constructor(
    @InjectRepository(Campanha)
    private repo: Repository<Campanha>,
  ) {}

  async findActiveForClinic(clinicId: string) {
    return this.repo.find({ where: { active: true, clinicId }, order: { createdAt: 'DESC' }});
  }
}
