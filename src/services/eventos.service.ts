import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Evento } from '../entities/evento.entity';
import { applyClinicIdFilter } from '../lib/tenant';

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(Evento)
    private repo: Repository<Evento>,
  ) {}

  async listByClinic(clinicId: string) {
    const qb = this.repo.createQueryBuilder('e').orderBy('e.createdAt', 'DESC');
    applyClinicIdFilter(qb as SelectQueryBuilder<Evento>, clinicId);
    return qb.getMany();
  }
}
