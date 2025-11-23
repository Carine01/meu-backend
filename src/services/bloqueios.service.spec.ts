// src/services/bloqueios.service.spec.ts
import { Test } from '@nestjs/testing';
import { BloqueiosService } from '../modules/agendamentos/bloqueios.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Bloqueio } from '../modules/agendamentos/entities/bloqueio.entity';

const r = () => ({ save: jest.fn(), find: jest.fn() });

describe('BloqueiosService', () => {
  let service: BloqueiosService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BloqueiosService,
        { provide: getRepositoryToken(Bloqueio), useValue: r() },
      ],
    }).compile();
    service = module.get(BloqueiosService);
  });

  it('cria bloqueio', async () => {
    const res = await service.create({ motivo: 'spam' });
    expect(res).toBeDefined();
  });
});
