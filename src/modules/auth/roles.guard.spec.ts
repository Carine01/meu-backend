import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new RolesGuard(reflector);
  });

  it('permite acesso se não há roles requeridas', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { roles: ['user'] } }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any as ExecutionContext;
    expect(guard.canActivate(context)).toBe(true);
  });

  it('permite acesso se usuário tem role requerida', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { roles: ['admin'] } }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any as ExecutionContext;
    expect(guard.canActivate(context)).toBe(true);
  });

  it('nega acesso se usuário não tem role requerida', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['admin']);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { roles: ['user'] } }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any as ExecutionContext;
    expect(guard.canActivate(context)).toBe(false);
  });
});
