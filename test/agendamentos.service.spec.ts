import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgendamentosService } from '../src/modules/agendamentos/agendamentos.service';
import { Agendamento } from '../src/modules/agendamentos/entities/agendamento.entity';
import { BloqueiosService } from '../src/modules/agendamentos/bloqueios.service';

describe('AgendamentosService', () => {
  let service: AgendamentosService;
  let repository: Repository<Agendamento>;
  let bloqueiosService: BloqueiosService;

  const mockAgendamento: Partial<Agendamento> = {
    id: '123',
    leadId: 'lead-123',
    dataHora: new Date('2025-11-25T10:00:00'),
    procedimento: 'Depilação a laser',
    status: 'confirmado',
    duracao: 60,
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
      getMany: jest.fn(),
      getOne: jest.fn(),
    })),
  };

  const mockBloqueiosService = {
    validarHorario: jest.fn(),
    isHorarioBloqueado: jest.fn(),
    sugerirAlternativas: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendamentosService,
        {
          provide: getRepositoryToken(Agendamento),
          useValue: mockRepository,
        },
        {
          provide: BloqueiosService,
          useValue: mockBloqueiosService,
        },
      ],
    }).compile();

    service = module.get<AgendamentosService>(AgendamentosService);
    repository = module.get<Repository<Agendamento>>(getRepositoryToken(Agendamento));
    bloqueiosService = module.get<BloqueiosService>(BloqueiosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new appointment', async () => {
      const createDto = {
        leadId: 'lead-123',
        dataHora: new Date('2025-11-25T10:00:00'),
        procedimento: 'Depilação a laser',
        duracao: 60,
      };

      mockBloqueiosService.validarHorario.mockResolvedValue(true);
      mockRepository.create.mockReturnValue(mockAgendamento);
      mockRepository.save.mockResolvedValue(mockAgendamento);

      const result = await service.create(createDto);

      expect(mockBloqueiosService.validarHorario).toHaveBeenCalledWith(createDto.dataHora);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockAgendamento);
    });

    it('should reject blocked time slots', async () => {
      const createDto = {
        leadId: 'lead-123',
        dataHora: new Date('2025-11-25T13:00:00'), // Horário de almoço
        procedimento: 'Depilação a laser',
        duracao: 60,
      };

      mockBloqueiosService.validarHorario.mockResolvedValue(false);

      await expect(service.create(createDto)).rejects.toThrow();
    });

    it('should reject appointments on holidays', async () => {
      const createDto = {
        leadId: 'lead-123',
        dataHora: new Date('2025-12-25T10:00:00'), // Natal
        procedimento: 'Depilação a laser',
        duracao: 60,
      };

      mockBloqueiosService.isHorarioBloqueado.mockResolvedValue(true);

      await expect(service.create(createDto)).rejects.toThrow();
    });
  });

  describe('findByLead', () => {
    it('should find all appointments for a lead', async () => {
      const leadId = 'lead-123';
      const appointments = [mockAgendamento, { ...mockAgendamento, id: '456' }];

      mockRepository.find.mockResolvedValue(appointments);

      const result = await service.findByLead(leadId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { leadId },
        order: { dataHora: 'DESC' },
      });
      expect(result).toEqual(appointments);
    });
  });

  describe('confirmar', () => {
    it('should confirm an appointment', async () => {
      mockRepository.findOne.mockResolvedValue(mockAgendamento);
      mockRepository.save.mockResolvedValue({ 
        ...mockAgendamento, 
        status: 'confirmado',
        confirmedAt: new Date(),
      });

      const result = await service.confirmar('123');

      expect(result.status).toBe('confirmado');
      expect(result.confirmedAt).toBeDefined();
    });

    it('should not confirm already completed appointment', async () => {
      mockRepository.findOne.mockResolvedValue({ 
        ...mockAgendamento, 
        status: 'concluido' 
      });

      await expect(service.confirmar('123')).rejects.toThrow();
    });
  });

  describe('cancelar', () => {
    it('should cancel an appointment', async () => {
      const motivo = 'Cliente solicitou cancelamento';
      
      mockRepository.findOne.mockResolvedValue(mockAgendamento);
      mockRepository.save.mockResolvedValue({ 
        ...mockAgendamento, 
        status: 'cancelado',
        motivoCancelamento: motivo,
      });

      const result = await service.cancelar('123', motivo);

      expect(result.status).toBe('cancelado');
      expect(result.motivoCancelamento).toBe(motivo);
    });

    it('should enforce 24h cancellation policy', async () => {
      const amanha = new Date();
      amanha.setDate(amanha.getDate() + 1);
      amanha.setHours(10, 0, 0, 0);

      const appointmentAmanha = {
        ...mockAgendamento,
        dataHora: amanha,
      };

      mockRepository.findOne.mockResolvedValue(appointmentAmanha);

      // Cancelamento com menos de 24h deve gerar warning/taxa
      await expect(service.cancelar('123', 'Emergência')).rejects.toThrow();
    });
  });

  describe('reagendar', () => {
    it('should reschedule an appointment', async () => {
      const novaData = new Date('2025-11-26T14:00:00');

      mockRepository.findOne.mockResolvedValue(mockAgendamento);
      mockBloqueiosService.validarHorario.mockResolvedValue(true);
      mockRepository.save.mockResolvedValue({ 
        ...mockAgendamento, 
        dataHora: novaData,
        reagendadoEm: new Date(),
      });

      const result = await service.reagendar('123', novaData);

      expect(result.dataHora).toEqual(novaData);
      expect(result.reagendadoEm).toBeDefined();
    });
  });

  describe('marcarNoShow', () => {
    it('should mark appointment as no-show', async () => {
      mockRepository.findOne.mockResolvedValue(mockAgendamento);
      mockRepository.save.mockResolvedValue({ 
        ...mockAgendamento, 
        status: 'nao_compareceu',
      });

      const result = await service.marcarNoShow('123');

      expect(result.status).toBe('nao_compareceu');
    });
  });

  describe('concluir', () => {
    it('should complete an appointment', async () => {
      const observacoes = 'Sessão realizada com sucesso';

      mockRepository.findOne.mockResolvedValue(mockAgendamento);
      mockRepository.save.mockResolvedValue({ 
        ...mockAgendamento, 
        status: 'concluido',
        observacoes,
        concluidoEm: new Date(),
      });

      const result = await service.concluir('123', observacoes);

      expect(result.status).toBe('concluido');
      expect(result.observacoes).toBe(observacoes);
      expect(result.concluidoEm).toBeDefined();
    });
  });

  describe('buscarProximos', () => {
    it('should fetch upcoming appointments', async () => {
      const appointments = [mockAgendamento];
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(appointments);

      const result = await service.buscarProximos(7); // Próximos 7 dias

      expect(result).toEqual(appointments);
      expect(queryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('buscarPorData', () => {
    it('should fetch appointments for a specific date', async () => {
      const data = new Date('2025-11-25');
      const appointments = [mockAgendamento];

      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(appointments);

      const result = await service.buscarPorData(data);

      expect(result).toEqual(appointments);
    });
  });
});
