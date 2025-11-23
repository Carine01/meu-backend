// src/modules/agendamentos/bloqueios.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BloqueiosService } from './bloqueios.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Bloqueio } from './entities/bloqueio.entity';
import { Repository } from 'typeorm';

describe('BloqueiosService', () => {
  let service: BloqueiosService;
  let repository: Repository<Bloqueio>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BloqueiosService,
        {
          provide: getRepositoryToken(Bloqueio),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BloqueiosService>(BloqueiosService);
    repository = module.get<Repository<Bloqueio>>(getRepositoryToken(Bloqueio));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Multitenancy - clinicId filtering', () => {
    it('should create lunch blocks only for specific clinicId', async () => {
      const clinicId = 'CLINICA_1';
      
      mockRepository.create.mockImplementation((data) => data);
      mockRepository.save.mockImplementation((data) => Promise.resolve(data));

      await service.bloquearAlmoco(clinicId);

      // Verify that all saved bloqueios have the correct clinicId
      const calls = mockRepository.save.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      calls.forEach((call: any) => {
        expect(call[0].clinicId).toBe(clinicId);
      });
    });

    it('should create saturday blocks only for specific clinicId', async () => {
      const clinicId = 'CLINICA_2';
      
      mockRepository.create.mockImplementation((data) => data);
      mockRepository.save.mockImplementation((data) => Promise.resolve(data));

      await service.bloquearSabados(clinicId);

      const calls = mockRepository.save.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      calls.forEach((call: any) => {
        expect(call[0].clinicId).toBe(clinicId);
      });
    });

    it('should create holiday blocks only for specific clinicId', async () => {
      const clinicId = 'CLINICA_3';
      
      mockRepository.create.mockImplementation((data) => data);
      mockRepository.save.mockImplementation((data) => Promise.resolve(data));

      await service.bloquearFeriados(clinicId);

      const calls = mockRepository.save.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      calls.forEach((call: any) => {
        expect(call[0].clinicId).toBe(clinicId);
      });
    });

    it('should only check blocks for specific clinicId when verifying availability', async () => {
      const clinicId = 'CLINICA_1';
      const data = '2025-01-15';
      const hora = '12:30';
      
      const mockBloqueios = [
        {
          clinicId: 'CLINICA_1',
          data: '2025-01-15',
          startTime: '12:00',
          endTime: '14:00',
          motivo: 'Almoço',
          tipo: 'almoco',
        },
      ];

      mockRepository.find.mockResolvedValue(mockBloqueios);

      const result = await service.isHorarioBloqueado(clinicId, data, hora, 60);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          clinicId,
          data,
        },
      });
      expect(result.bloqueado).toBe(true);
    });

    it('should only list blocks for specific clinicId', async () => {
      const clinicId = 'CLINICA_1';
      const mockBloqueios = [
        { id: '1', clinicId: 'CLINICA_1', data: '2025-12-25', motivo: 'Natal' },
        { id: '2', clinicId: 'CLINICA_1', data: '2025-01-01', motivo: 'Ano Novo' },
      ];

      mockRepository.find.mockResolvedValue(mockBloqueios);

      const result = await service.listarBloqueios(clinicId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { clinicId },
        order: { data: 'ASC' },
      });
      expect(result).toHaveLength(2);
      expect(result.every((b: any) => b.clinicId === clinicId)).toBe(true);
    });

    it('should suggest available hours only from clinic blocks', async () => {
      const clinicId = 'CLINICA_1';
      const data = '2025-01-15';
      
      mockRepository.find.mockResolvedValue([
        {
          clinicId: 'CLINICA_1',
          data: '2025-01-15',
          startTime: '12:00',
          endTime: '14:00',
          motivo: 'Almoço',
          tipo: 'almoco',
        },
      ]);

      const result = await service.sugerirHorarioLivre(clinicId, data, 60);

      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ clinicId }),
        })
      );
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should not return blocks from other clinics when checking availability', async () => {
      const clinicId = 'CLINICA_1';
      const data = '2025-01-15';
      const hora = '10:00';
      
      // Mock returns empty - no blocks for this clinic
      mockRepository.find.mockResolvedValue([]);

      const result = await service.isHorarioBloqueado(clinicId, data, hora, 60);

      expect(result.bloqueado).toBe(false);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          clinicId,
          data,
        },
      });
    });
  });

  it('should remove a block', async () => {
    mockRepository.delete.mockResolvedValue({ affected: 1 });

    await service.removerBloqueio('bloqueio-123');

    expect(mockRepository.delete).toHaveBeenCalledWith('bloqueio-123');
  });
});
