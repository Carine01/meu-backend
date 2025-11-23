import { renderHook } from '@testing-library/react';
import { useRole } from '../useRole';

function setToken(token: string | null) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

describe('useRole', () => {
  afterEach(() => setToken(null));

  it('retorna null se não há token', () => {
    setToken(null);
    const { result } = renderHook(() => useRole());
    expect(result.current).toBeNull();
  });

  it('retorna o role do token JWT', () => {
    // JWT fake com payload { "role": "admin" }
    const payload = btoa(JSON.stringify({ role: 'admin' }));
    setToken(`header.${payload}.signature`);
    const { result } = renderHook(() => useRole());
    expect(result.current).toBe('admin');
  });

  it('retorna null se token é inválido', () => {
    setToken('invalid.token');
    const { result } = renderHook(() => useRole());
    expect(result.current).toBeNull();
  });
});
