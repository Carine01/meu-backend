// src/services/mensagens.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MensagensService } from './mensagens.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Mensagem } from '../entities/mensagem.entity';

const mockRepo = () => ({ find: jest.fn(), save: jest.fn() });

describe('MensagensService', () => {
  let service: MensagensService;
  let repo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MensagensService,
        { provide: getRepositoryToken(Mensagem), useValue: mockRepo() },
      ],
    }).compile();
    service = module.get(MensagensService);
    repo = module.get(getRepositoryToken(Mensagem));
  });

  it('deve enviar mensagem (mock)', async () => {
    repo.save.mockResolvedValue({ id: 1, texto: 'ok' });
    const res = await service.send({ texto: 'ok' });
    expect(res).toHaveProperty('id');
  });
});
