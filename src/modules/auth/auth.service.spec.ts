// src/modules/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { FirebaseAuthService } from '../../firebase-auth.service';
import { UnauthorizedException } from '@nestjs/common';

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockFirebaseAuth = {
  verifyIdToken: jest.fn(),
  createUser: jest.fn(),
  getUserByEmail: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let firebaseAuth: FirebaseAuthService;

  beforeEach(async () => {
    const mockUsuarioRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        senha: 'senha123',
        nome: 'Usuário Teste',
        clinicId: 'clinic-01',
        roles: ['user'],
      }),
      save: jest.fn(),
      create: jest.fn((dto) => ({ ...dto, uid: 'new-user-456' })),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: FirebaseAuthService,
          useValue: mockFirebaseAuth,
        },
        {
          provide: 'UsuarioRepository',
          useValue: mockUsuarioRepo,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    firebaseAuth = module.get<FirebaseAuthService>(FirebaseAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve validar token Firebase e retornar JWT', async () => {
    const fakeToken = 'firebase-token-123';
    const fakeUser = {
      uid: 'user-123',
      email: 'test@example.com',
      clinicId: 'clinic-01',
    };

    mockFirebaseAuth.verifyIdToken.mockResolvedValue(fakeUser);
    mockJwtService.sign.mockReturnValue('jwt-token-abc');

    // Corrigir para usar LoginDto
    const resultado = await service.login({ idToken: fakeToken } as any);

    expect(resultado).toHaveProperty('accessToken', 'jwt-token-abc');
    expect(mockFirebaseAuth.verifyIdToken).toHaveBeenCalledWith(fakeToken);
    expect(mockJwtService.sign).toHaveBeenCalled();
  });

  it('deve lançar erro para token inválido', async () => {
    mockFirebaseAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

    await expect(service.login({ idToken: 'invalid' } as any))
      .rejects
      .toThrow(UnauthorizedException);
  });

  it('deve registrar novo usuário', async () => {
    // Corrigir para usar todos campos obrigatórios do RegisterDto
    const novoUsuario = {
      email: 'novo@example.com',
      password: 'senha123',
      clinicId: 'clinic-02',
      senha: 'senha123',
      nome: 'Novo Usuário',
    };

    mockFirebaseAuth.createUser.mockResolvedValue({
      uid: 'new-user-456',
      email: novoUsuario.email,
    });

    const resultado = await service.register(novoUsuario);

    expect(resultado).toHaveProperty('uid', 'new-user-456');
    expect(mockFirebaseAuth.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: novoUsuario.email,
      })
    );
  });

  it('deve verificar credenciais JWT', async () => {
    const payload = { sub: 'user-123', email: 'test@example.com' };
    mockJwtService.verify.mockReturnValue(payload);

    const resultado = await service.validateToken('jwt-token');

    expect(resultado).toEqual(payload);
    expect(mockJwtService.verify).toHaveBeenCalledWith('jwt-token');
  });
});
