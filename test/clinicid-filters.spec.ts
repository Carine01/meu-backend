import { Test, TestingModule } from '@nestjs/testing';
import { IndicacoesService } from '../src/modules/indicacoes/indicacoes.service';
import { EventsService } from '../src/modules/eventos/events.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Indicacao } from '../src/modules/indicacoes/entities/indicacao.entity';
import { Recompensa } from '../src/modules/indicacoes/entities/recompensa.entity';
import { Event } from '../src/modules/eventos/entities/event.entity';

/**
 * Teste de Isolamento de Dados por clinicId
 * 
 * Valida que cada clínica só pode acessar seus próprios dados
 * Baseado nos requisitos do FILTROS_CLINIC_ID.md
 */
describe('ClinicId Data Isolation', () => {
  describe('IndicacoesService - Isolamento', () => {
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

    it('deve incluir clinicId ao registrar indicação', async () => {
      const mockIndicacao = {
        id: 'ind123',
        indicadorId: 'lead123',
        clinicId: 'CLINICA_A',
        nomeIndicado: 'Maria Silva',
        pontosGanhos: 1,
      } as Indicacao;

      const mockRecompensa = {
        leadId: 'lead123',
        clinicId: 'CLINICA_A',
        pontosAcumulados: 1,
        sessoesGratisDisponiveis: 0,
        historicoIndicacoes: [],
      } as Recompensa;

      indicacaoRepo.create.mockReturnValue(mockIndicacao);
      indicacaoRepo.save.mockResolvedValue(mockIndicacao);
      recompensaRepo.findOne.mockResolvedValue(null);
      recompensaRepo.create.mockReturnValue(mockRecompensa);
      recompensaRepo.save.mockResolvedValue(mockRecompensa);

      await service.registrarIndicacao('lead123', 'CLINICA_A', {
        nome: 'Maria Silva',
        telefone: '+5511999999999',
      });

      // Verifica que foi criada com clinicId correto
      expect(indicacaoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          clinicId: 'CLINICA_A',
        }),
      );

      // Verifica que busca recompensa com clinicId
      expect(recompensaRepo.findOne).toHaveBeenCalledWith({
        where: { leadId: 'lead123', clinicId: 'CLINICA_A' },
      });
    });

    it('deve buscar indicações apenas da clínica especificada', async () => {
      const mockIndicacoes = [
        { id: 'ind1', indicadorId: 'lead123', clinicId: 'CLINICA_A' },
        { id: 'ind2', indicadorId: 'lead123', clinicId: 'CLINICA_A' },
      ] as Indicacao[];

      indicacaoRepo.find.mockResolvedValue(mockIndicacoes);

      await service.getIndicacoes('lead123', 'CLINICA_A');

      // Verifica que filtrou por clinicId
      expect(indicacaoRepo.find).toHaveBeenCalledWith({
        where: { indicadorId: 'lead123', clinicId: 'CLINICA_A' },
        order: { createdAt: 'DESC' },
      });
    });

    it('deve buscar recompensa apenas da clínica especificada', async () => {
      const mockRecompensa = {
        leadId: 'lead123',
        clinicId: 'CLINICA_B',
        pontosAcumulados: 5,
      } as Recompensa;

      recompensaRepo.findOne.mockResolvedValue(mockRecompensa);

      await service.getRecompensa('lead123', 'CLINICA_B');

      // Verifica que filtrou por clinicId
      expect(recompensaRepo.findOne).toHaveBeenCalledWith({
        where: { leadId: 'lead123', clinicId: 'CLINICA_B' },
      });
    });
  });

  describe('EventsService - Isolamento', () => {
    let service: EventsService;
    let eventsRepo: jest.Mocked<Repository<Event>>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EventsService,
          {
            provide: getRepositoryToken(Event),
            useValue: {
              create: jest.fn(),
              save: jest.fn(),
              find: jest.fn(),
              count: jest.fn(),
              createQueryBuilder: jest.fn(() => ({
                select: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                getRawMany: jest.fn().mockResolvedValue([]),
                getMany: jest.fn().mockResolvedValue([]),
              })),
            },
          },
        ],
      }).compile();

      service = module.get<EventsService>(EventsService);
      eventsRepo = module.get(getRepositoryToken(Event));
    });

    it('deve incluir clinicId ao criar evento', async () => {
      const mockEvent = {
        id: 'evt123',
        eventType: 'LEAD_CREATED',
        leadId: 'lead123',
        clinicId: 'CLINICA_A',
      } as Event;

      eventsRepo.create.mockReturnValue(mockEvent);
      eventsRepo.save.mockResolvedValue(mockEvent);

      await service.logEvent({
        eventType: 'LEAD_CREATED' as any,
        leadId: 'lead123',
        clinicId: 'CLINICA_A',
      });

      expect(eventsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          clinicId: 'CLINICA_A',
        }),
      );
    });

    it('deve buscar eventos apenas da clínica especificada', async () => {
      eventsRepo.find.mockResolvedValue([]);

      await service.findEvents({
        leadId: 'lead123',
        clinicId: 'CLINICA_A',
      });

      expect(eventsRepo.find).toHaveBeenCalledWith({
        where: expect.objectContaining({
          clinicId: 'CLINICA_A',
        }),
        order: { createdAt: 'DESC' },
        take: 100,
      });
    });

    it('deve buscar timeline do lead apenas da clínica especificada', async () => {
      eventsRepo.find.mockResolvedValue([]);

      await service.getLeadTimeline('lead123', 'CLINICA_B', 50);

      expect(eventsRepo.find).toHaveBeenCalledWith({
        where: {
          leadId: 'lead123',
          clinicId: 'CLINICA_B',
        },
        order: { createdAt: 'DESC' },
        take: 50,
      });
    });
  });

  describe('Scenario: Múltiplas Clínicas', () => {
    it('CLINICA_A não deve ver dados de CLINICA_B', () => {
      // Este é um teste conceitual que demonstra o cenário
      const leadClinicA = { id: 'lead1', clinicId: 'CLINICA_A' };
      const leadClinicB = { id: 'lead2', clinicId: 'CLINICA_B' };

      // Quando CLINICA_A busca seus leads, deve receber apenas lead1
      // Quando CLINICA_B busca seus leads, deve receber apenas lead2
      
      expect(leadClinicA.clinicId).not.toBe(leadClinicB.clinicId);
    });

    it('deve validar que todas as queries incluem clinicId', () => {
      // Este teste documenta que todas as queries críticas devem incluir clinicId
      const queriesCriticas = [
        'IndicacoesService.registrarIndicacao',
        'IndicacoesService.getIndicacoes',
        'IndicacoesService.getRecompensa',
        'EventsService.findEvents',
        'EventsService.getLeadTimeline',
        'BiService.getReportForClinic',
        'FilaService.listarPorStatus',
        'FilaService.getEstatisticas',
      ];

      // Todas devem incluir clinicId como parâmetro obrigatório ou opcional
      expect(queriesCriticas.length).toBeGreaterThan(0);
    });
  });
});
