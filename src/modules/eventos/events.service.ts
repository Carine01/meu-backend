import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere, In } from 'typeorm';
import { Event, EventType } from './entities/event.entity';

export interface CreateEventDto {
  eventType: EventType;
  leadId?: string;
  clinicId?: string;
  agendamentoId?: string;
  mensagemId?: string;
  campanhaId?: string;
  indicacaoId?: string;
  metadata?: Record<string, any>;
  before?: Record<string, any>;
  after?: Record<string, any>;
  userId?: string;
  ipAddress?: string;
  source?: string;
}

export interface EventQueryDto {
  leadId?: string;
  clinicId?: string;
  eventType?: EventType | EventType[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  /**
   * Registra um novo evento no sistema
   */
  async logEvent(dto: CreateEventDto): Promise<Event> {
    try {
      const event = this.eventsRepository.create({
        ...dto,
        eventDate: new Date(), // Para facilitar queries por data
        source: dto.source || 'system',
      });

      const saved = await this.eventsRepository.save(event);
      
      this.logger.debug(
        `Event logged: ${dto.eventType} for lead ${dto.leadId || 'N/A'}`,
        {
          eventType: dto.eventType,
          leadId: dto.leadId,
          agendamentoId: dto.agendamentoId,
          mensagemId: dto.mensagemId,
          source: dto.source,
          userId: dto.userId,
        },
      );

      return saved;
    } catch (error: any) {
      this.logger.error(`Failed to log event: ${error.message}`, {
        eventType: dto.eventType,
        leadId: dto.leadId,
        error: error.message,
        stack: error.stack,
      });
      // Não lança erro para não quebrar o fluxo principal
      return undefined as any;
    }
  }

  /**
   * Busca eventos com filtros
   */
  async findEvents(query: EventQueryDto): Promise<Event[]> {
    const where: FindOptionsWhere<Event> = {};

    if (query.leadId) {
      where.leadId = query.leadId;
    }

    if (query.clinicId) {
      where.clinicId = query.clinicId;
    }

    if (query.eventType) {
      if (Array.isArray(query.eventType)) {
        // @ts-ignore - TypeORM aceita array para IN query
        where.eventType = query.eventType;
      } else {
        where.eventType = query.eventType;
      }
    }

    if (query.startDate && query.endDate) {
      where.createdAt = Between(query.startDate, query.endDate);
    }

    return this.eventsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: query.limit || 100,
    });
  }

  /**
   * Busca timeline completa de um lead
   */
  async getLeadTimeline(leadId: string, clinicId?: string, limit = 50): Promise<Event[]> {
    const where: FindOptionsWhere<Event> = { leadId };
    
    if (clinicId) {
      where.clinicId = clinicId;
    }
    
    return this.eventsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Busca eventos de um tipo específico
   */
  async getEventsByType(
    eventType: EventType,
    clinicId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Event[]> {
    const where: FindOptionsWhere<Event> = { eventType };

    if (clinicId) {
      where.clinicId = clinicId;
    }

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    return this.eventsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 1000,
    });
  }

  /**
   * Estatísticas de eventos por tipo
   */
  async getEventStats(startDate: Date, endDate: Date, clinicId?: string): Promise<Record<string, number>> {
    const query = this.eventsRepository
      .createQueryBuilder('event')
      .select('event.eventType', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .where('event.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    
    if (clinicId) {
      query.andWhere('event.clinicId = :clinicId', { clinicId });
    }
    
    query.groupBy('event.eventType');

    const results = await query.getRawMany();

    const stats: Record<string, number> = {};
    results.forEach((r) => {
      stats[r.eventType] = parseInt(r.count, 10);
    });

    return stats;
  }

  /**
   * Eventos recentes do sistema (últimas 24h)
   */
  async getRecentEvents(clinicId?: string, limit = 100): Promise<Event[]> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const where: FindOptionsWhere<Event> = {
      createdAt: Between(oneDayAgo, new Date()),
    };
    
    if (clinicId) {
      where.clinicId = clinicId;
    }

    return this.eventsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Conta eventos de um tipo específico para um lead
   */
  async countEventsByLeadAndType(
    leadId: string,
    eventType: EventType,
    clinicId?: string,
  ): Promise<number> {
    const where: FindOptionsWhere<Event> = { leadId, eventType };
    
    if (clinicId) {
      where.clinicId = clinicId;
    }
    
    return this.eventsRepository.count({
      where,
    });
  }

  /**
   * Marca eventos como processados (para processamento assíncrono)
   */
  async markAsProcessed(eventIds: string[]): Promise<void> {
    await this.eventsRepository.update(
      eventIds,
      { processed: true },
    );
  }

  /**
   * Busca eventos não processados
   */
  async getUnprocessedEvents(limit = 100): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { processed: false },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  /**
   * Limpa eventos antigos (mais de 6 meses)
   */
  async cleanOldEvents(): Promise<number> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const result = await this.eventsRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :date', { date: sixMonthsAgo })
      .execute();

    this.logger.log(`Cleaned ${result.affected} old events`);
    return result.affected || 0;
  }

  /**
   * Busca mudanças de stage de um lead
   */
  async getStageChanges(leadId: string, clinicId?: string): Promise<Event[]> {
    const where: FindOptionsWhere<Event> = {
      leadId,
      eventType: EventType.STAGE_CHANGED,
    };
    
    if (clinicId) {
      where.clinicId = clinicId;
    }
    
    return this.eventsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Busca histórico de mensagens enviadas para um lead
   */
  async getMessageHistory(leadId: string, clinicId?: string): Promise<Event[]> {
    const messageTypes = [
      EventType.MESSAGE_SENT,
      EventType.MESSAGE_DELIVERED,
      EventType.MESSAGE_READ,
      EventType.MESSAGE_REPLIED,
    ];

    const query = this.eventsRepository
      .createQueryBuilder('event')
      .where('event.leadId = :leadId', { leadId })
      .andWhere('event.eventType IN (:...types)', { types: messageTypes });
    
    if (clinicId) {
      query.andWhere('event.clinicId = :clinicId', { clinicId });
    }
    
    return query
      .orderBy('event.createdAt', 'DESC')
      .getMany();
  }
}

