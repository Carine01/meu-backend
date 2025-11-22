import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService - clinicId in JWT', () => {
  let service: AuthService;
  let mockUserRepo: Partial<Repository<Usuario>>;
  let mockJwtService: Partial<JwtService>;

  beforeEach(() => {
    mockUserRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'u1',
        email: 'test@test.com',
        senha: 'hashedpass',
        clinicId: 'C1',
        ativo: true,
        roles: ['user']
      })
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('token123')
    };

    service = new AuthService(
      mockUserRepo as Repository<Usuario>,
      mockJwtService as JwtService
    );

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  it('should include clinicId in token payload', async () => {
    const result = await service.login({ email: 'test@test.com', senha: 'pass123' });

    expect(mockJwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({ clinicId: 'C1' })
    );
    expect(result.access_token).toBe('token123');
    expect(result.user.clinicId).toBe('C1');
  });

  it('should allow override clinicId when provided', async () => {
    const result = await service.login(
      { email: 'test@test.com', senha: 'pass123' },
      'C2'
    );

    expect(mockJwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({ clinicId: 'C2' })
    );
    expect(result.user.clinicId).toBe('C2');
  });
});
