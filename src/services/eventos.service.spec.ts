// src/services/eventos.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EventosService } from './eventos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Evento } from '../entities/evento.entity';

const mock = () => ({ find: jest.fn(), save: jest.fn() });

describe('EventosService', () => {
  let service: EventosService;
  let repo;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EventosService,
        { provide: getRepositoryToken(Evento), useValue: mock() },
      ],
    }).compile();
    service = module.get(EventosService);
    repo = module.get(getRepositoryToken(Evento));
  });

  it('lista eventos', async () => {
    repo.find.mockResolvedValue([{ id: 1 }]);
    expect(await service.findAll()).toEqual([{ id: 1 }]);
  });
});
