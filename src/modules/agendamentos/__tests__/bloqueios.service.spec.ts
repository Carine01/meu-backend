import { BloqueiosService } from '../bloqueios.service';
import { Repository } from 'typeorm';
import { Bloqueio } from '../entities/bloqueio.entity';

describe('BloqueiosService - clinicId filter', () => {
  let service: BloqueiosService;
  let mockRepo: Partial<Repository<Bloqueio>>;

  beforeEach(() => {
    mockRepo = {
      find: jest.fn().mockResolvedValue([
        { id: 'b1', clinicId: 'C1', data: '2025-11-22', tipo: 'almoco' },
        { id: 'b2', clinicId: 'C1', data: '2025-11-23', tipo: 'feriado' }
      ])
    };

    service = new BloqueiosService(mockRepo as Repository<Bloqueio>);
  });

  it('should return only bloqueios for specified clinic', async () => {
    const result = await service.listForClinic('C1');

    expect(mockRepo.find).toHaveBeenCalledWith({ where: { clinicId: 'C1' }});
    expect(result).toHaveLength(2);
    expect(result.every(b => b.clinicId === 'C1')).toBe(true);
  });

  it('should throw error if clinicId is empty', async () => {
    await expect(service.listForClinic('')).rejects.toThrow('clinicId é obrigatório');
  });
});
