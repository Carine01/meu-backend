import { Test, TestingModule } from '@nestjs/testing';
import { PacientesService } from './pacientes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Paciente } from './entities/paciente.entity';

describe('PacientesService', () => {
  let service: PacientesService;
  let repo: { find: jest.Mock };

  beforeEach(async () => {
    repo = { find: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PacientesService,
        { provide: getRepositoryToken(Paciente), useValue: repo },
      ],
    }).compile();

    service = module.get<PacientesService>(PacientesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should only return data for the correct clinicId', async () => {
    repo.find.mockResolvedValue([
      { id: 1, clinicId: 'CLINICA_1' },
      { id: 2, clinicId: 'CLINICA_1' },
    ]);
    const data = await service.findAllByClinic('CLINICA_1');
    expect(data.every(d => d.clinicId === 'CLINICA_1')).toBe(true);
  });
});
