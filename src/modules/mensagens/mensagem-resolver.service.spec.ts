// src/modules/mensagens/mensagem-resolver.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MensagemResolverService } from './mensagem-resolver.service';

const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  get: jest.fn(),
  set: jest.fn(),
};

describe('MensagemResolverService', () => {
  let service: MensagemResolverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MensagemResolverService,
        {
          provide: 'FIRESTORE',
          useValue: mockFirestore,
        },
      ],
    }).compile();

    service = module.get<MensagemResolverService>(MensagemResolverService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve resolver template de mensagem', async () => {
    const template = 'Olá {{nome}}, bem-vindo!';
    const vars = { nome: 'João' };
    const resultado = await service.resolverTemplate(template, vars);
    expect(resultado).toBe('Olá João, bem-vindo!');
  });

  it('deve lidar com variáveis faltantes', async () => {
    const template = 'Olá {{nome}}, seu pedido {{pedidoId}}';
    const vars = { nome: 'Maria' };
    const resultado = await service.resolverTemplate(template, vars);
    expect(resultado).toContain('Maria');
    expect(resultado).toContain('{{pedidoId}}'); // Mantém se não encontrar
  });
});
