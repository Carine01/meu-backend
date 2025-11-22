// src/modules/bi/bi.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BiService } from './bi.service';

const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  get: jest.fn(),
};

describe('BiService', () => {
  let service: BiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BiService,
        {
          provide: 'FIRESTORE',
          useValue: mockFirestore,
        },
      ],
    }).compile();

    service = module.get<BiService>(BiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve gerar summary com métricas', async () => {
    mockFirestore.get.mockResolvedValue({
      size: 150,
      docs: [],
    });

    const resultado = await service.summary();

    expect(resultado).toHaveProperty('total');
    expect(resultado).toHaveProperty('periodo');
    expect(typeof resultado.total).toBe('number');
  });

  it('deve calcular conversão de leads', async () => {
    mockFirestore.get
      .mockResolvedValueOnce({ size: 100 }) // total leads
      .mockResolvedValueOnce({ size: 25 }); // leads convertidos

    const resultado = await service.calcularConversao('clinic-01');

    expect(resultado).toHaveProperty('taxaConversao');
    expect(resultado.taxaConversao).toBe(25);
    expect(resultado).toHaveProperty('totalLeads', 100);
    expect(resultado).toHaveProperty('convertidos', 25);
  });

  it('deve retornar métricas de mensagens', async () => {
    const fakeMensagens = [
      { id: '1', status: 'sent' },
      { id: '2', status: 'sent' },
      { id: '3', status: 'failed' },
    ];

    mockFirestore.get.mockResolvedValue({
      docs: fakeMensagens.map(m => ({
        id: m.id,
        data: () => m,
      })),
    });

    const resultado = await service.metricasMensagens();

    expect(resultado).toHaveProperty('enviadas');
    expect(resultado).toHaveProperty('falhas');
    expect(mockFirestore.collection).toHaveBeenCalledWith(expect.stringContaining('mensagens'));
  });

  it('deve filtrar métricas por período', async () => {
    const dataInicio = new Date('2025-01-01');
    const dataFim = new Date('2025-01-31');

    mockFirestore.get.mockResolvedValue({
      size: 50,
      docs: [],
    });

    const resultado = await service.metricasPorPeriodo(dataInicio, dataFim);

    expect(mockFirestore.where).toHaveBeenCalledWith(
      'createdAt',
      '>=',
      expect.any(Object)
    );
    expect(mockFirestore.where).toHaveBeenCalledWith(
      'createdAt',
      '<=',
      expect.any(Object)
    );
    expect(resultado).toHaveProperty('total', 50);
  });
});
