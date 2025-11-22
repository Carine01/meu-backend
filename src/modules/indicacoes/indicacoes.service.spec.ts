import { Test, TestingModule } from '@nestjs/testing';
import { IndicacoesService } from './indicacoes.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Indicacao } from './entities/indicacao.entity';
import { Recompensa } from './entities/recompensa.entity';

describe('IndicacoesService', () => {
  let service: IndicacoesService;
  let indicacaoRepo: jest.Mocked<Repository<Indicacao>>;
  let recompensaRepo: jest.Mocked<Repository<Recompensa>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndicacoesService,
        {
          provide: getRepositoryToken(Indicacao),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Recompensa),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IndicacoesService>(IndicacoesService);
    indicacaoRepo = module.get(getRepositoryToken(Indicacao));
    recompensaRepo = module.get(getRepositoryToken(Recompensa));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('registrarIndicacao', () => {
    it('deve registrar indicação e adicionar 1 ponto', async () => {
      const mockIndicacao = {
        id: 'ind123',
        indicadorId: 'lead123',
        nomeIndicado: 'Maria Silva',
        telefoneIndicado: '+5511999999999',
        status: 'pendente',
        pontosGanhos: 1,
      } as Indicacao;

      const mockRecompensa = {
        id: 'rec123',
        leadId: 'lead123',
        clinicId: 'elevare-01',
        pontosAcumulados: 0,
        sessoesGratisDisponiveis: 0,
        historicoIndicacoes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Recompensa;

      indicacaoRepo.create.mockReturnValue(mockIndicacao);
      indicacaoRepo.save.mockResolvedValue(mockIndicacao);
      recompensaRepo.findOne.mockResolvedValue(mockRecompensa);
      recompensaRepo.save.mockResolvedValue({
        ...mockRecompensa,
        pontosAcumulados: 1,
        historicoIndicacoes: ['ind123'],
      });

      const result = await service.registrarIndicacao('lead123', {
        nome: 'Maria Silva',
        telefone: '+5511999999999',
      });

      expect(result.indicacao).toEqual(mockIndicacao);
      expect(result.recompensa.pontosAcumulados).toBe(1);
      expect(indicacaoRepo.save).toHaveBeenCalled();
      expect(recompensaRepo.save).toHaveBeenCalled();
    });

    it('deve ganhar sessão grátis ao atingir 3 pontos', async () => {
      const mockIndicacao = {
        id: 'ind456',
        indicadorId: 'lead456',
        pontosGanhos: 1,
      } as Indicacao;

      const mockRecompensaExistente = {
        id: 'rec456',
        leadId: 'lead456',
        clinicId: 'elevare-01',
        pontosAcumulados: 2, // Já tem 2 pontos
        sessoesGratisDisponiveis: 0,
        historicoIndicacoes: ['ind1', 'ind2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Recompensa;

      indicacaoRepo.create.mockReturnValue(mockIndicacao);
      indicacaoRepo.save.mockResolvedValue(mockIndicacao);
      recompensaRepo.findOne.mockResolvedValue(mockRecompensaExistente);
      
      const recompensaAtualizada = {
        ...mockRecompensaExistente,
        pontosAcumulados: 3, // Agora tem 3 pontos
        sessoesGratisDisponiveis: 1, // Ganhou 1 sessão
        historicoIndicacoes: ['ind1', 'ind2', 'ind456'],
      };
      
      recompensaRepo.save.mockResolvedValue(recompensaAtualizada);

      const result = await service.registrarIndicacao('lead456', {
        nome: 'João Silva',
        telefone: '+5511888888888',
      });

      expect(result.recompensa.pontosAcumulados).toBe(3);
      expect(result.recompensa.sessoesGratisDisponiveis).toBe(1);
    });

    it('deve criar nova recompensa se lead não tiver', async () => {
      const mockIndicacao = {
        id: 'ind789',
        indicadorId: 'lead789',
        pontosGanhos: 1,
      } as Indicacao;

      indicacaoRepo.create.mockReturnValue(mockIndicacao);
      indicacaoRepo.save.mockResolvedValue(mockIndicacao);
      recompensaRepo.findOne.mockResolvedValue(null); // Não existe recompensa

      const novaRecompensa = {
        leadId: 'lead789',
        pontosAcumulados: 1,
        sessoesGratisDisponiveis: 0,
        historicoIndicacoes: ['ind789'],
      } as Recompensa;

      recompensaRepo.create.mockReturnValue(novaRecompensa);
      recompensaRepo.save.mockResolvedValue(novaRecompensa);

      const result = await service.registrarIndicacao('lead789', {
        nome: 'Pedro Santos',
        telefone: '+5511777777777',
      });

      expect(recompensaRepo.create).toHaveBeenCalled();
      expect(result.recompensa.pontosAcumulados).toBe(1);
    });
  });

  describe('getRecompensa', () => {
    it('deve retornar recompensa do lead', async () => {
      const mockRecompensa = {
        id: 'rec123',
        leadId: 'lead123',
        clinicId: 'elevare-01',
        pontosAcumulados: 5,
        sessoesGratisDisponiveis: 1,
        historicoIndicacoes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Recompensa;

      recompensaRepo.findOne.mockResolvedValue(mockRecompensa);

      const result = await service.getRecompensa('lead123');

      expect(result).toEqual(mockRecompensa);
      expect(recompensaRepo.findOne).toHaveBeenCalledWith({
        where: { leadId: 'lead123' },
      });
    });
  });
});
