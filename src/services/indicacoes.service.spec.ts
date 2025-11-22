// src/services/indicacoes.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { IndicacoesService } from './indicacoes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Indicacao } from '../entities/indicacao.entity';
import { Repository } from 'typeorm';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('IndicacoesService', () => {
  let service: IndicacoesService;
  let repo: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndicacoesService,
        {
          provide: getRepositoryToken(Indicacao),
          useValue: createMockRepository(),
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
    const result = await service.findAll();
    expect(result).toEqual(fake);
    expect(repo.find).toHaveBeenCalled();
  });

  it('deve criar indicacao', async () => {
    const dto = { nome: 'Novo' };
    const saved = { id: 2, ...dto };
    repo.save!.mockResolvedValue(saved);
    const res = await service.create(dto);
    expect(res).toEqual(saved);
    expect(repo.save).toHaveBeenCalledWith(dto);
  });
});
