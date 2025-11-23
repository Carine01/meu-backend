// src/modules/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt at the module level
jest.mock('bcrypt');

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockUsuarioRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let usuarioRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    usuarioRepo = module.get(getRepositoryToken(Usuario));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('deve fazer login com credenciais válidas e retornar access_token e refresh_token', async () => {
      const usuario = {
        id: 'user-123',
        email: 'test@example.com',
        senha: 'hashed-password',
        nome: 'Teste',
        clinicId: 'clinic-01',
        roles: ['user'],
        ativo: true,
      };

      mockUsuarioRepository.findOne.mockResolvedValue(usuario);
      mockJwtService.sign.mockReturnValueOnce('access-token-abc').mockReturnValueOnce('refresh-token-xyz');
      mockConfigService.get.mockReturnValue('refresh-secret');
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const resultado = await service.login({ email: 'test@example.com', senha: 'senha123' });

      expect(resultado).toHaveProperty('access_token', 'access-token-abc');
      expect(resultado).toHaveProperty('refresh_token', 'refresh-token-xyz');
      expect(resultado).toHaveProperty('user');
      expect(resultado.user.email).toBe('test@example.com');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('deve lançar erro para email inválido', async () => {
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.login({ email: 'invalid@example.com', senha: 'senha123' }))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('deve lançar erro para senha inválida', async () => {
      const usuario = {
        id: 'user-123',
        email: 'test@example.com',
        senha: 'hashed-password',
        ativo: true,
      };

      mockUsuarioRepository.findOne.mockResolvedValue(usuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'test@example.com', senha: 'wrong-password' }))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('deve renovar access_token com refresh_token válido', async () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        clinicId: 'clinic-01',
        roles: ['user'],
      };

      const usuario = {
        id: 'user-123',
        email: 'test@example.com',
        ativo: true,
      };

      // Reset mock to ensure clean state
      mockJwtService.sign.mockReset();
      mockConfigService.get.mockReturnValue('refresh-secret');
      mockJwtService.verify.mockReturnValue(payload);
      mockUsuarioRepository.findOne.mockResolvedValue(usuario);
      mockJwtService.sign.mockReturnValue('new-access-token');

      const resultado = await service.refreshToken('valid-refresh-token');

      expect(resultado).toHaveProperty('access_token', 'new-access-token');
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-refresh-token', { secret: 'refresh-secret' });
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-123',
          email: 'test@example.com',
        }),
        { expiresIn: '15m' }
      );
    });

    it('deve lançar erro para refresh_token inválido', async () => {
      mockConfigService.get.mockReturnValue('refresh-secret');
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid-token'))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('deve lançar erro se usuário não existir ou estiver inativo', async () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        clinicId: 'clinic-01',
        roles: ['user'],
      };

      mockConfigService.get.mockReturnValue('refresh-secret');
      mockJwtService.verify.mockReturnValue(payload);
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.refreshToken('valid-refresh-token'))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('deve registrar novo usuário', async () => {
      const registerDto = {
        email: 'novo@example.com',
        senha: 'senha123',
        nome: 'Novo Usuario',
        clinicId: 'clinic-02',
      };

      mockUsuarioRepository.findOne.mockResolvedValue(null);
      mockUsuarioRepository.create.mockReturnValue({ ...registerDto, id: 'new-user-456' });
      mockUsuarioRepository.save.mockResolvedValue({ ...registerDto, id: 'new-user-456' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const resultado = await service.register(registerDto);

      expect(resultado).toHaveProperty('id', 'new-user-456');
      expect(mockUsuarioRepository.create).toHaveBeenCalled();
      expect(mockUsuarioRepository.save).toHaveBeenCalled();
    });

    it('deve lançar erro ao tentar registrar email duplicado', async () => {
      const registerDto = {
        email: 'existente@example.com',
        senha: 'senha123',
        nome: 'Usuario',
        clinicId: 'clinic-01',
      };

      mockUsuarioRepository.findOne.mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(registerDto))
        .rejects
        .toThrow(ConflictException);
    });
  });
});
