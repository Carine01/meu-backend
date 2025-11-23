import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { EventsService, EventQueryDto } from './events.service';
import { EventType } from './entities/event.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('eventos')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * GET /eventos/timeline/:leadId
   * Retorna timeline completa de um lead
   */
  @Get('timeline/:leadId')
  async getLeadTimeline(
    @Param('leadId') leadId: string,
    @Query('limit') limit?: string,
  ) {
    const events = await this.eventsService.getLeadTimeline(
      leadId,
      limit ? parseInt(limit, 10) : 50,
    );

    return {
      leadId,
      total: events.length,
      events,
    };
  }

  /**
   * GET /eventos/search
   * Busca eventos com filtros
   */
  @Get('search')
  async searchEvents(
    @Query('leadId') leadId?: string,
    @Query('eventType') eventType?: EventType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    const query: EventQueryDto = {
      leadId,
      eventType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit, 10) : 100,
    };

    const events = await this.eventsService.findEvents(query);

    return {
      total: events.length,
      query,
      events,
    };
  }

  /**
   * GET /eventos/stats
   * Estatísticas de eventos por tipo
   */
  @Get('stats')
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await this.eventsService.getEventStats(start, end);

    return {
      period: { start, end },
      stats,
    };
  }

  /**
   * GET /eventos/recent
   * Eventos recentes (últimas 24h)
   */
  @Get('recent')
  async getRecent(@Query('limit') limit?: string) {
    const events = await this.eventsService.getRecentEvents(
      limit ? parseInt(limit, 10) : 100,
    );

    return {
      total: events.length,
      events,
    };
  }

  /**
   * GET /eventos/stage-changes/:leadId
   * Histórico de mudanças de stage
   */
  @Get('stage-changes/:leadId')
  async getStageChanges(@Param('leadId') leadId: string) {
    const changes = await this.eventsService.getStageChanges(leadId);

    return {
      leadId,
      total: changes.length,
      changes,
    };
  }

  /**
   * GET /eventos/messages/:leadId
   * Histórico de mensagens
   */
  @Get('messages/:leadId')
  async getMessageHistory(@Param('leadId') leadId: string) {
    const messages = await this.eventsService.getMessageHistory(leadId);

    return {
      leadId,
      total: messages.length,
      messages,
    };
  }
}

