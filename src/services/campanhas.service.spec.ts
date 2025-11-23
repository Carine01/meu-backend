// src/services/campanhas.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AgendaSemanalService as CampanhasService } from '../modules/campanhas/agenda-semanal.service';
import { FilaService } from '../modules/fila/fila.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Campanha } from '../modules/campanhas/entities/campanha.entity';

type MockRepo = { findOne: jest.Mock; save: jest.Mock };
const repo = (): MockRepo => ({ findOne: jest.fn(), save: jest.fn() });

describe('CampanhasService', () => {
  let service: CampanhasService;
  let r: MockRepo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampanhasService,
        { provide: 'CampanhaRepository', useValue: repo() },
        { provide: FilaService, useValue: { adicionarNaFila: jest.fn() } },
      ],
    }).compile();
    service = module.get(CampanhasService);
    r = module.get<MockRepo>('CampanhaRepository');
  });

  it('cria campanha', async () => {
    r.save.mockResolvedValue({ id: 'mock-id', titulo: 'X', ativo: true });
    // Ajuste: método correto é criarCampanha
    const res = await service.criarCampanha({ titulo: 'X', ativo: true });
    expect(res).toEqual({ id: 'mock-id', titulo: 'X', ativo: true });
  });
});
