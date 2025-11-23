// src/modules/eventos/events.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';

const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  get: jest.fn(),
  add: jest.fn(),
};

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const mockRepo = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: 'FIRESTORE',
          useValue: mockFirestore,
        },
        {
          provide: 'EventRepository',
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve listar eventos recentes', async () => {
    const fakeEventos = [
      { id: '1', tipo: 'lead_criado', data: new Date() },
      { id: '2', tipo: 'mensagem_enviada', data: new Date() },
    ];

    mockFirestore.get.mockResolvedValue({
      empty: false,
      docs: fakeEventos.map(e => ({
        id: e.id,
        data: () => e,
      })),
    });

    const resultado = await service.findAll();
    expect(resultado).toHaveLength(2);
    expect(mockFirestore.collection).toHaveBeenCalledWith('eventos');
  });

  it('deve registrar novo evento', async () => {
    mockFirestore.add.mockResolvedValue({ id: 'evento-123' });

    const evento = {
      tipo: 'agendamento_criado',
      payload: { leadId: 'lead-456' },
      timestamp: new Date(),
    };

    const resultado = await service.registrar(evento);
    expect(resultado).toHaveProperty('id');
    expect(mockFirestore.add).toHaveBeenCalledWith(expect.objectContaining({
      tipo: 'agendamento_criado',
    }));
  });

  it('deve filtrar eventos por tipo', async () => {
    mockFirestore.get.mockResolvedValue({
      empty: false,
      docs: [
        { id: '1', data: () => ({ tipo: 'lead_criado' }) },
      ],
    });

    const resultado = await service.findByTipo('lead_criado');
    expect(mockFirestore.where).toHaveBeenCalledWith('tipo', '==', 'lead_criado');
    expect(resultado).toBeDefined();
  });
});
