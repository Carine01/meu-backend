// src/services/campanhas.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CampanhasService } from './campanhas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Campanha } from '../entities/campanha.entity';

const repo = () => ({ findOne: jest.fn(), save: jest.fn() });

describe('CampanhasService', () => {
  let service: CampanhasService;
  let r;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampanhasService,
        { provide: getRepositoryToken(Campanha), useValue: repo() },
      ],
    }).compile();
    service = module.get(CampanhasService);
    r = module.get(getRepositoryToken(Campanha));
  });

  it('cria campanha', async () => {
    r.save.mockResolvedValue({ id: 1 });
    const res = await service.create({ titulo: 'X' });
    expect(res).toEqual({ id: 1 });
  });
});
