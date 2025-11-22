import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Bloqueio } from '../entities/bloqueio.entity';

@Injectable()
export class BloqueiosService {
  constructor(@InjectRepository(Bloqueio) private repo: Repository<Bloqueio>) {}

  async listForClinic(clinicId: string) {
    return this.repo.find({ where: { clinicId }});
  }
}
