// src/services/auth.service.spec.ts
import { Test } from '@nestjs/testing';
import { AuthService } from '../modules/auth/auth.service';
import { UsersService } from './users.service';

const userMock = { findOneByEmail: jest.fn() };

describe('AuthService', () => {
  let auth: AuthService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: userMock },
      ],
    }).compile();
    auth = module.get(AuthService);
  });

  it('validar credenciais', async () => {
    userMock.findOneByEmail.mockResolvedValue({ id: 1, password: 'hash' });
    jest.spyOn(auth as any, 'comparePassword').mockResolvedValue(true);
    const res = await auth.validateUser('a@b', 'secret');
    expect(res).toBeDefined();
  });
});
