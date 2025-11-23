// src/modules/campanhas/agenda-semanal.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AgendaSemanalService } from './agenda-semanal.service';

const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  get: jest.fn(),
  add: jest.fn(),
};

describe('AgendaSemanalService', () => {
  let service: AgendaSemanalService;

  beforeEach(async () => {
    const mockFilaService = {
      adicionarNaFila: jest.fn(),
      processarFila: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendaSemanalService,
        {
          provide: 'FIRESTORE',
          useValue: mockFirestore,
        },
        {
          provide: 'FilaService',
          useValue: mockFilaService,
        },
      ],
    }).compile();

    service = module.get<AgendaSemanalService>(AgendaSemanalService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve criar campanha semanal', async () => {
    mockFirestore.add.mockResolvedValue({ id: 'campanha-123' });
    
    const campanha = {
      titulo: 'Lembrete Semanal',
      diaSemana: 'segunda',
      horario: '09:00',
    };

    const resultado = await service.criarCampanha(campanha);
    expect(resultado).toHaveProperty('id');
    expect(mockFirestore.add).toHaveBeenCalled();
  });

  it('deve listar campanhas ativas', async () => {
    const fakeCampanhas = [
      { id: '1', titulo: 'Campanha A', ativa: true },
      { id: '2', titulo: 'Campanha B', ativa: true },
    ];

    mockFirestore.get.mockResolvedValue({
      empty: false,
      docs: fakeCampanhas.map(c => ({
        id: c.id,
        data: () => c,
      })),
    });

    const resultado = await service.listarAtivas();
    expect(resultado).toHaveLength(2);
    expect(mockFirestore.where).toHaveBeenCalledWith('ativa', '==', true);
  });
});
