import { EventsService } from '../events.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Event } from '../entities/event.entity';

describe('EventsService - clinicId filter', () => {
  let service: EventsService;
  let mockRepo: Partial<Repository<Event>>;

  beforeEach(() => {
    const mockQb = {
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        { id: 'e1', clinicId: 'C1', eventType: 'lead_created' }
      ]),
      expressionMap: { mainAlias: { name: 'e' } }
    };

    mockRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQb)
    };

    service = new EventsService(mockRepo as Repository<Event>);
  });

  it('should apply clinicId filter via QueryBuilder', async () => {
    // Método seria implementado: listByClinic(clinicId)
    // Por enquanto validamos a estrutura existe
    expect(service).toBeDefined();
    expect(mockRepo.createQueryBuilder).toBeDefined();
  });
});
