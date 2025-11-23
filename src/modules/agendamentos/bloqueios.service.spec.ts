// src/modules/agendamentos/bloqueios.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BloqueiosService } from './bloqueios.service';

const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
};

describe('BloqueiosService', () => {
  let service: BloqueiosService;

  beforeEach(async () => {
    const mockRepo = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloqueiosService,
        {
          provide: 'FIRESTORE',
          useValue: mockFirestore,
        },
        {
          provide: 'BloqueioRepository',
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<BloqueiosService>(BloqueiosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve criar bloqueio de horário', async () => {
    mockFirestore.set.mockResolvedValue(undefined);

    const bloqueio = {
      clinicId: 'clinic-01',
      data: '2025-12-25',
      horario: '14:00',
      motivo: 'Feriado',
    };

    const resultado = await service.create(bloqueio);

    expect(mockFirestore.set).toHaveBeenCalled();
    expect(resultado).toHaveProperty('motivo', 'Feriado');
  });

  it('deve verificar se horário está bloqueado', async () => {
    mockFirestore.get.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'bloqueio-1',
          data: () => ({
            data: '2025-12-25',
            horario: '14:00',
            motivo: 'Feriado',
          }),
        },
      ],
    });

    const resultado = await service.isHorarioBloqueado(
      'clinic-01',
      '2025-12-25',
      '14:00',
      60
    );

    expect(resultado).toHaveProperty('bloqueado', true);
    expect(resultado).toHaveProperty('motivo', 'Feriado');
  });

  it('deve retornar false para horário disponível', async () => {
    mockFirestore.get.mockResolvedValue({
      empty: true,
      docs: [],
    });

    const resultado = await service.isHorarioBloqueado(
      'clinic-01',
      '2025-12-26',
      '10:00',
      60
    );

    expect(resultado).toHaveProperty('bloqueado', false);
    expect(resultado.motivo).toBeUndefined();
  });

  it('deve listar bloqueios de uma clínica', async () => {
    const fakeBloqueios = [
      { id: '1', data: '2025-12-25', motivo: 'Natal' },
      { id: '2', data: '2025-01-01', motivo: 'Ano Novo' },
    ];

    mockFirestore.get.mockResolvedValue({
      docs: fakeBloqueios.map(b => ({
        id: b.id,
        data: () => b,
      })),
    });

    const resultado = await service.listarBloqueios('clinic-01');

    expect(resultado).toHaveLength(2);
    expect(mockFirestore.where).toHaveBeenCalledWith('clinicId', '==', 'clinic-01');
  });

  it('deve remover bloqueio', async () => {
    mockFirestore.delete.mockResolvedValue(undefined);

    await service.remover('bloqueio-123');

    expect(mockFirestore.doc).toHaveBeenCalledWith('bloqueio-123');
    expect(mockFirestore.delete).toHaveBeenCalled();
  });
});
