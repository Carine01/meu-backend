import { AgendamentosService } from '../agendamentos.service';
import { Repository } from 'typeorm';
import { Agendamento } from '../entities/agendamento.entity';

describe('AgendamentosService - clinicId isolation', () => {
  let service: AgendamentosService;
  let repository: Repository<Agendamento>;

  beforeEach(() => {
    repository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getOne: jest.fn().mockResolvedValue(null),
      }),
    } as any;

    service = new AgendamentosService(repository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have listarPorClinica method', () => {
    expect(service.listarPorClinica).toBeDefined();
    expect(typeof service.listarPorClinica).toBe('function');
  });

  it('should have buscarPorIdEClinica method', () => {
    expect(service.buscarPorIdEClinica).toBeDefined();
    expect(typeof service.buscarPorIdEClinica).toBe('function');
  });

  it('should have confirmarAgendamentoPorClinica method', () => {
    expect(service.confirmarAgendamentoPorClinica).toBeDefined();
    expect(typeof service.confirmarAgendamentoPorClinica).toBe('function');
  });

  it('should throw error for empty clinicId in listarPorClinica', async () => {
    await expect(service.listarPorClinica('')).rejects.toThrow('clinicId é obrigatório');
  });

  it('should throw error for empty clinicId in buscarPorIdEClinica', async () => {
    await expect(service.buscarPorIdEClinica('id123', '')).rejects.toThrow('clinicId é obrigatório');
  });

  it('should throw error for empty clinicId in confirmarAgendamentoPorClinica', async () => {
    await expect(service.confirmarAgendamentoPorClinica('id123', '')).rejects.toThrow('clinicId é obrigatório');
  });

  // Note: Full integration tests would require real database
});
