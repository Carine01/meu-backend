import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Metric } from '../entities/metric.entity';

@Injectable()
export class BiService {
  constructor(@InjectRepository(Metric) private repo: Repository<Metric>) {}

  async getReportForClinic(clinicId: string) {
    return this.repo.find({ where: { clinicId }});
  }
}
