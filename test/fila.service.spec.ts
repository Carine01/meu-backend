import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilaService } from '../src/modules/fila/fila.service';
import { FilaMensagem } from '../src/modules/fila/entities/fila-mensagem.entity';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';

describe('FilaService', () => {
  let service: FilaService;
  let repository: Repository<FilaMensagem>;
  let httpService: HttpService;

  const mockFilaMensagem: Partial<FilaMensagem> = {
    id: '123',
    leadId: 'lead-123',
    templateKey: 'BOASVINDAS_01',
    destinatario: '+5511999999999',
    status: 'pendente',
    tentativas: 0,
    proximaTentativa: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockHttpService = {
    post: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilaService,
        {
          provide: getRepositoryToken(FilaMensagem),
          useValue: mockRepository,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<FilaService>(FilaService);
    repository = module.get<Repository<FilaMensagem>>(getRepositoryToken(FilaMensagem));
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enfileirar', () => {
    it('should enqueue a message', async () => {
      const dto = {
        leadId: 'lead-123',
        templateKey: 'BOASVINDAS_01',
        destinatario: '+5511999999999',
        variaveis: { nome: 'Maria' },
      };

      mockRepository.create.mockReturnValue(mockFilaMensagem);
      mockRepository.save.mockResolvedValue(mockFilaMensagem);

      const result = await service.enfileirar(dto);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockFilaMensagem);
    });

    it('should schedule message for commercial hours', async () => {
      const dto = {
        leadId: 'lead-123',
        templateKey: 'BOASVINDAS_01',
        destinatario: '+5511999999999',
        variaveis: { nome: 'Maria' },
      };

      // Simula horário não comercial (22h)
      const now = new Date();
      now.setHours(22, 0, 0, 0);
      jest.spyOn(global, 'Date').mockImplementation(() => now as any);

      mockRepository.create.mockReturnValue(mockFilaMensagem);
      mockRepository.save.mockResolvedValue(mockFilaMensagem);

      const result = await service.enfileirar(dto);

      expect(result.proximaTentativa.getHours()).toBeGreaterThanOrEqual(9);
      expect(result.proximaTentativa.getHours()).toBeLessThanOrEqual(18);
    });
  });

  describe('processar', () => {
    it('should process a pending message successfully', async () => {
      const mensagem = { ...mockFilaMensagem, status: 'pendente' };
      
      mockRepository.findOne.mockResolvedValue(mensagem);
      mockHttpService.post.mockReturnValue(of({ data: { success: true } }));
      mockRepository.save.mockResolvedValue({ ...mensagem, status: 'enviado' });

      const result = await service.processar('123');

      expect(mockHttpService.post).toHaveBeenCalled();
      expect(result.status).toBe('enviado');
    });

    it('should retry on failure', async () => {
      const mensagem = { ...mockFilaMensagem, tentativas: 0 };
      
      mockRepository.findOne.mockResolvedValue(mensagem);
      mockHttpService.post.mockReturnValue(throwError(() => new Error('Network error')));
      mockRepository.save.mockResolvedValue({ ...mensagem, tentativas: 1, status: 'pendente' });

      const result = await service.processar('123');

      expect(result.tentativas).toBe(1);
      expect(result.status).toBe('pendente');
    });

    it('should mark as failed after 3 attempts', async () => {
      const mensagem = { ...mockFilaMensagem, tentativas: 2 };
      
      mockRepository.findOne.mockResolvedValue(mensagem);
      mockHttpService.post.mockReturnValue(throwError(() => new Error('Network error')));
      mockRepository.save.mockResolvedValue({ ...mensagem, tentativas: 3, status: 'falha' });

      const result = await service.processar('123');

      expect(result.tentativas).toBe(3);
      expect(result.status).toBe('falha');
    });
  });

  describe('buscarPendentes', () => {
    it('should fetch pending messages within commercial hours', async () => {
      const agora = new Date();
      agora.setHours(14, 0, 0, 0); // 14h - horário comercial
      jest.spyOn(global, 'Date').mockImplementation(() => agora as any);

      const mensagens = [mockFilaMensagem];
      const queryBuilder = mockRepository.createQueryBuilder();
      queryBuilder.getMany.mockResolvedValue(mensagens);

      const result = await service.buscarPendentes(10);

      expect(result).toEqual(mensagens);
      expect(queryBuilder.where).toHaveBeenCalled();
    });

    it('should not fetch messages outside commercial hours', async () => {
      const agora = new Date();
      agora.setHours(20, 0, 0, 0); // 20h - fora do horário
      jest.spyOn(global, 'Date').mockImplementation(() => agora as any);

      const result = await service.buscarPendentes(10);

      expect(result).toEqual([]);
    });
  });

  describe('cancelar', () => {
    it('should cancel a pending message', async () => {
      const mensagem = { ...mockFilaMensagem, status: 'pendente' };
      
      mockRepository.findOne.mockResolvedValue(mensagem);
      mockRepository.save.mockResolvedValue({ ...mensagem, status: 'cancelado' });

      const result = await service.cancelar('123');

      expect(result.status).toBe('cancelado');
    });

    it('should not cancel already sent message', async () => {
      const mensagem = { ...mockFilaMensagem, status: 'enviado' };
      
      mockRepository.findOne.mockResolvedValue(mensagem);

      await expect(service.cancelar('123')).rejects.toThrow();
    });
  });

  describe('reprocessar', () => {
    it('should reset a failed message for reprocessing', async () => {
      const mensagem = { ...mockFilaMensagem, status: 'falha', tentativas: 3 };
      
      mockRepository.findOne.mockResolvedValue(mensagem);
      mockRepository.save.mockResolvedValue({ 
        ...mensagem, 
        status: 'pendente', 
        tentativas: 0,
        proximaTentativa: new Date(),
      });

      const result = await service.reprocessar('123');

      expect(result.status).toBe('pendente');
      expect(result.tentativas).toBe(0);
    });
  });
});
