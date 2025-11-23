// src/services/mensagens.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MensagemResolverService as MensagensService } from '../modules/mensagens/mensagem-resolver.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MensagemTemplate } from '../modules/mensagens/entities/mensagem.entity';

type MockRepo = { find: jest.Mock; save: jest.Mock };
const mockRepo = (): MockRepo => ({ find: jest.fn(), save: jest.fn() });

describe('MensagensService', () => {
  let service: MensagensService;
  let repo: MockRepo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MensagensService,
        { provide: 'MensagemRepository', useValue: mockRepo() },
      ],
    }).compile();
    service = module.get(MensagensService);
    repo = module.get<MockRepo>('MensagemRepository');
  });

  it('deve enviar mensagem (mock)', async () => {
    repo.save.mockResolvedValue({ key: 'mock', template: 'ok', ativo: true });
    const res = await service.send({ template: 'ok', ativo: true });
    expect(res).toHaveProperty('template');
  });
});
