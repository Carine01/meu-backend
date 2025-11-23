import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';

@Injectable()
export class PaymentsService {
  constructor(@InjectRepository(Order) private repo: Repository<Order>) {}

  async listOrdersForClinic(clinicId: string) {
    return this.repo.find({ where: { clinicId }, order: { createdAt: 'DESC' }});
  }
}
