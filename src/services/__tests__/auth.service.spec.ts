import { AuthService } from '../auth.service';
describe('AuthService clinicId in JWT', () => {
  it('includes clinicId in token payload when provided (mocked sign)', async () => {
    const jwt: any = { sign: jest.fn().mockReturnValue('token123'), verify: jest.fn().mockReturnValue({ sub: 'u1', clinicId: 'C1' }) };
    const svc = new AuthService(jwt);
    const res = await svc.login({ id: 'u1', username: 'u' }, 'C1');
    expect(res.access_token).toBe('token123');
    const decoded = svc.validateToken('token123', 'C1');
    expect(decoded.clinicId).toBe('C1');
  });
});
