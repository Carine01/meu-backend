// src/modules/eventos/events.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event, EventType } from './entities/event.entity';
import { Repository } from 'typeorm';

describe('EventsService', () => {
  let service: EventsService;
  let repository: Repository<Event>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
      getMany: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    repository = module.get<Repository<Event>>(getRepositoryToken(Event));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Multitenancy - clinicId filtering', () => {
    it('should only return events for the correct clinicId when getting timeline', async () => {
      const clinicId = 'CLINICA_1';
      const leadId = 'lead-123';
      const mockEvents = [
        { id: '1', clinicId: 'CLINICA_1', leadId: 'lead-123', eventType: EventType.LEAD_CREATED },
        { id: '2', clinicId: 'CLINICA_1', leadId: 'lead-123', eventType: EventType.MESSAGE_SENT },
      ];

      mockRepository.find.mockResolvedValue(mockEvents);

      const result = await service.getLeadTimeline(clinicId, leadId, 50);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { clinicId, leadId },
        order: { createdAt: 'DESC' },
        take: 50,
      });
      expect(result).toHaveLength(2);
      expect(result.every(e => e.clinicId === clinicId)).toBe(true);
    });

    it('should filter events by clinicId in findEvents', async () => {
      const clinicId = 'CLINICA_2';
      const mockEvents = [
        { id: '1', clinicId: 'CLINICA_2', eventType: EventType.LEAD_CREATED },
      ];

      mockRepository.find.mockResolvedValue(mockEvents);

      const result = await service.findEvents({
        clinicId,
        limit: 100,
      });

      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ clinicId }),
        })
      );
      expect(result.every(e => e.clinicId === clinicId)).toBe(true);
    });

    it('should filter events by clinicId in getRecentEvents', async () => {
      const clinicId = 'CLINICA_3';
      const mockEvents = [
        { id: '1', clinicId: 'CLINICA_3', eventType: EventType.MESSAGE_SENT },
      ];

      mockRepository.find.mockResolvedValue(mockEvents);

      const result = await service.getRecentEvents(clinicId, 100);

      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ clinicId }),
        })
      );
      expect(result.every(e => e.clinicId === clinicId)).toBe(true);
    });

    it('should count events only for specific clinicId and lead', async () => {
      const clinicId = 'CLINICA_1';
      const leadId = 'lead-456';
      
      mockRepository.count.mockResolvedValue(5);

      const result = await service.countEventsByLeadAndType(
        clinicId,
        leadId,
        EventType.MESSAGE_SENT
      );

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { clinicId, leadId, eventType: EventType.MESSAGE_SENT },
      });
      expect(result).toBe(5);
    });

    it('should filter stage changes by clinicId', async () => {
      const clinicId = 'CLINICA_1';
      const leadId = 'lead-789';
      const mockEvents = [
        { id: '1', clinicId: 'CLINICA_1', leadId: 'lead-789', eventType: EventType.STAGE_CHANGED },
      ];

      mockRepository.find.mockResolvedValue(mockEvents);

      const result = await service.getStageChanges(clinicId, leadId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          clinicId,
          leadId,
          eventType: EventType.STAGE_CHANGED,
        },
        order: { createdAt: 'DESC' },
      });
      expect(result.every(e => e.clinicId === clinicId)).toBe(true);
    });

    it('should filter event stats by clinicId', async () => {
      const clinicId = 'CLINICA_1';
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { eventType: EventType.LEAD_CREATED, count: '10' },
          { eventType: EventType.MESSAGE_SENT, count: '25' },
        ]),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getEventStats(clinicId, startDate, endDate);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'event.clinicId = :clinicId',
        { clinicId }
      );
      expect(result).toEqual({
        [EventType.LEAD_CREATED]: 10,
        [EventType.MESSAGE_SENT]: 25,
      });
    });
  });

  describe('Event logging', () => {
    it('should log an event with clinicId', async () => {
      const eventDto = {
        eventType: EventType.LEAD_CREATED,
        leadId: 'lead-123',
        source: 'system',
      };

      const mockEvent = { id: 'event-1', ...eventDto, clinicId: 'CLINICA_1' };
      mockRepository.create.mockReturnValue(mockEvent);
      mockRepository.save.mockResolvedValue(mockEvent);

      const result = await service.logEvent(eventDto);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
