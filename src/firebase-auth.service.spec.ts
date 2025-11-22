import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAuthService } from './firebase-auth.service';

describe('FirebaseAuthService', () => {
  let service: FirebaseAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebaseAuthService],
    }).compile();

    service = module.get<FirebaseAuthService>(FirebaseAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw UnauthorizedException for invalid token', async () => {
    await expect(service.verifyToken('token_invalido')).rejects.toThrow();
  }, 30000); // Timeout de 30 segundos para teste de autenticação Firebase
});

