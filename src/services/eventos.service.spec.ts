// src/services/eventos.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EventsService as EventosService } from '../modules/eventos/events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Evento } from '../modules/eventos/entities/evento.entity';

type MockRepo = { find: jest.Mock; save: jest.Mock };
const mock = (): MockRepo => ({ find: jest.fn(), save: jest.fn() });

describe('EventosService', () => {
  let service: EventosService;
  let repo: MockRepo;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EventosService,
        { provide: getRepositoryToken(Evento), useValue: mock() },
      ],
    }).compile();
    service = module.get(EventosService);
    repo = module.get<MockRepo>(getRepositoryToken(Evento));
  });

  it('lista eventos', async () => {
    repo.find.mockResolvedValue([{ id: 1 }]);
    expect(await service.findAll()).toEqual([{ id: 1 }]);
  });
});
