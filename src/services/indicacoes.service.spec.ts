// src/services/indicacoes.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { IndicacoesService } from '../modules/indicacoes/indicacoes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Indicacao } from '../modules/indicacoes/entities/indicacao.entity';
import { Recompensa } from '../modules/indicacoes/entities/recompensa.entity';
import { Repository } from 'typeorm';

import { ObjectLiteral } from 'typeorm';
type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T extends ObjectLiteral = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  create: jest.fn((dto) => ({ ...dto, id: 'mock-id' })),
});

describe('IndicacoesService', () => {
  let service: IndicacoesService;
  let repo: MockRepository;

  beforeEach(async () => {
    const mockRecompensaRepo = createMockRepository();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndicacoesService,
        {
          provide: getRepositoryToken(Indicacao),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Recompensa),
          useValue: mockRecompensaRepo,
        },
      ],
    }).compile();

    service = module.get<IndicacoesService>(IndicacoesService);
    repo = module.get<MockRepository>(getRepositoryToken(Indicacao));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar lista de indicações', async () => {
    const fake = [{ id: 1, nome: 'A' }];
    repo.find!.mockResolvedValue(fake);
    // Garantir que o método findAll retorne o mock corretamente
    const result = await service.findAll();
    expect(result).toEqual(fake);
    expect(repo.find).toHaveBeenCalled();
  });

  it('deve criar indicacao', async () => {
    // Ajustar DTO para corresponder ao tipo esperado
    const dto = { nome: 'Novo', clinicId: 'clinic-01', pontos: 1 };
    const saved = { id: 'mock-id', ...dto };
    repo.create!.mockReturnValue(saved);
    repo.save!.mockResolvedValue(saved);
    const res = await service.create(dto);
    expect(res).toEqual(saved);
    expect(repo.save).toHaveBeenCalledWith(saved);
    expect(repo.create).toHaveBeenCalledWith(dto);
  });
});
