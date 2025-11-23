import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Mensagem } from '../entities/mensagem.entity';
import { applyClinicIdFilter } from '../lib/tenant';

@Injectable()
export class MensagensService {
  constructor(
    @InjectRepository(Mensagem)
    private repo: Repository<Mensagem>,
  ) {}

  // retorna mensagens apenas do clinicId informado
  async findAllForClinic(clinicId: string) {
    const qb = this.repo.createQueryBuilder('m').orderBy('m.createdAt', 'DESC');
    applyClinicIdFilter(qb as SelectQueryBuilder<Mensagem>, clinicId);
    return qb.getMany();
  }

  async createForClinic(data: Partial<Mensagem>, clinicId: string) {
    const entity = this.repo.create({ ...data, clinicId });
    return this.repo.save(entity);
  }
}