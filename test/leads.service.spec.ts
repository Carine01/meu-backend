import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadsService } from '../src/leads/leads.service';
import { Lead } from '../src/leads/entities/lead.entity';
import { LeadsScoreService } from '../src/leads/leads-score.service';

describe('LeadsService', () => {
  let service: LeadsService;
  let repository: Repository<Lead>;
  let scoreService: LeadsScoreService;

  const mockLead: Partial<Lead> = {
    id: '123',
    nome: 'Maria Silva',
    email: 'maria@example.com',
    telefone: '+5511999999999',
    stage: 'frio',
    score: 10,
    objetivo: 'Depilação a laser',
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
  };

  const mockScoreService = {
    calcularScore: jest.fn(),
    atualizarStage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: getRepositoryToken(Lead),
          useValue: mockRepository,
        },
        {
          provide: LeadsScoreService,
          useValue: mockScoreService,
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    repository = module.get<Repository<Lead>>(getRepositoryToken(Lead));
    scoreService = module.get<LeadsScoreService>(LeadsScoreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new lead', async () => {
      const createDto = {
        nome: 'Maria Silva',
        email: 'maria@example.com',
        telefone: '+5511999999999',
        objetivo: 'Depilação a laser',
      };

      mockRepository.create.mockReturnValue(mockLead);
      mockRepository.save.mockResolvedValue(mockLead);
      mockScoreService.calcularScore.mockReturnValue(10);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockLead);
    });

    it('should handle duplicate email', async () => {
      const createDto = {
        nome: 'Maria Silva',
        email: 'maria@example.com',
        telefone: '+5511999999999',
        objetivo: 'Depilação a laser',
      };

      mockRepository.save.mockRejectedValue({ code: '23505' }); // Postgres unique violation

      await expect(service.create(createDto)).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should find a lead by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockLead);

      const result = await service.findOne('123');

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '123' } });
      expect(result).toEqual(mockLead);
    });

    it('should return null if lead not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('999');

      expect(result).toBeNull();
    });
  });

  describe('updateScore', () => {
    it('should update lead score', async () => {
      const leadId = '123';
      const newScore = 50;

      mockRepository.findOne.mockResolvedValue(mockLead);
      mockRepository.save.mockResolvedValue({ ...mockLead, score: newScore });
      mockScoreService.atualizarStage.mockReturnValue('morno');

      const result = await service.updateScore(leadId, newScore);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: leadId } });
      expect(mockScoreService.atualizarStage).toHaveBeenCalledWith(newScore);
      expect(result.score).toBe(newScore);
    });
  });

  describe('findByStage', () => {
    it('should find leads by stage', async () => {
      const leads = [mockLead, { ...mockLead, id: '456' }];
      mockRepository.find.mockResolvedValue(leads);

      const result = await service.findByStage('frio');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { stage: 'frio' },
        order: { score: 'DESC', createdAt: 'DESC' },
      });
      expect(result).toEqual(leads);
    });
  });

  describe('search', () => {
    it('should search leads with filters', async () => {
      const searchDto = {
        query: 'Maria',
        stage: 'frio',
        page: 1,
        limit: 10,
      };

      const leads = [mockLead];
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getManyAndCount.mockResolvedValue([leads, 1]);

      const result = await service.search(searchDto);

      expect(result.data).toEqual(leads);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('delete', () => {
    it('should delete a lead', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete('123');

      expect(mockRepository.delete).toHaveBeenCalledWith('123');
    });

    it('should handle non-existent lead', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete('999')).rejects.toThrow();
    });
  });
});
