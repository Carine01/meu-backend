import { Controller, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { EventsService, EventQueryDto } from './events.service';
import { EventType } from './entities/event.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('eventos')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Obter timeline completa de um lead
   * 
   * Retorna todos os eventos relacionados a um lead em ordem cronológica reversa.
   * Útil para:
   * - Visualizar histórico completo
   * - Auditoria de ações
   * - Análise de comportamento
   * 
   * @param leadId - ID do lead
   * @param limit - Número máximo de eventos (padrão: 50)
   * @returns Timeline com eventos do lead
   * 
   * @example
   * GET /eventos/timeline/lead123?limit=100
   * Authorization: Bearer <token>
   * 
   * Response:
   * {
   *   "leadId": "lead123",
   *   "total": 25,
   *   "events": [
   *     {
   *       "eventType": "LEAD_CREATED",
   *       "eventDate": "2025-11-20T10:00:00Z",
   *       "metadata": {...}
   *     },
   *     ...
   *   ]
   * }
   */
  @Get('timeline/:leadId')
  async getLeadTimeline(
    @Param('leadId') leadId: string,
    @Query('limit') limit?: string,
    @Req() req?: any,
  ) {
    const clinicId = req.user?.clinicId || 'ELEVARE_MAIN';
    const events = await this.eventsService.getLeadTimeline(
      leadId,
      clinicId,
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
    @Req() req?: any,
  ) {
    const clinicId = req.user?.clinicId || 'ELEVARE_MAIN';
    const query: EventQueryDto = {
      leadId,
      clinicId,
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
   * Obter estatísticas de eventos por tipo
   * 
   * Agrega eventos por tipo no período especificado.
   * Útil para dashboards e análises.
   * 
   * @param startDate - Data inicial (ISO 8601) - padrão: 30 dias atrás
   * @param endDate - Data final (ISO 8601) - padrão: hoje
   * @returns Estatísticas agregadas por tipo de evento
   * 
   * @example
   * GET /eventos/stats?startDate=2025-11-01&endDate=2025-11-30
   * Authorization: Bearer <token>
   * 
   * Response:
   * {
   *   "period": {
   *     "start": "2025-11-01T00:00:00Z",
   *     "end": "2025-11-30T23:59:59Z"
   *   },
   *   "stats": {
   *     "LEAD_CREATED": 150,
   *     "MESSAGE_SENT": 450,
   *     "AGENDAMENTO_CREATED": 75
   *   }
   * }
   */
  @Get('stats')
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any,
  ) {
    const clinicId = req.user?.clinicId || 'ELEVARE_MAIN';
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await this.eventsService.getEventStats(start, end, clinicId);

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
  async getRecent(@Query('limit') limit?: string, @Req() req?: any) {
    const clinicId = req.user?.clinicId || 'ELEVARE_MAIN';
    const events = await this.eventsService.getRecentEvents(
      clinicId,
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
  async getStageChanges(@Param('leadId') leadId: string, @Req() req?: any) {
    const clinicId = req.user?.clinicId || 'ELEVARE_MAIN';
    const changes = await this.eventsService.getStageChanges(leadId, clinicId);

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
  async getMessageHistory(@Param('leadId') leadId: string, @Req() req?: any) {
    const clinicId = req.user?.clinicId || 'ELEVARE_MAIN';
    const messages = await this.eventsService.getMessageHistory(leadId, clinicId);

    return {
      leadId,
      total: messages.length,
      messages,
    };
  }
}

