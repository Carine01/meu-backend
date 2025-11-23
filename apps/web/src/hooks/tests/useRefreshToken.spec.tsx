import { renderHook, act } from '@testing-library/react';
import { useRefreshToken } from '../useRefreshToken';

global.fetch = jest.fn();

describe('useRefreshToken', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
    localStorage.clear();
  });

  it('lança erro se não há refresh_token', async () => {
    const { result } = renderHook(() => useRefreshToken());
    await expect(result.current()).rejects.toThrow('No refresh token');
  });

  it('faz refresh e salva novo token', async () => {
    localStorage.setItem('refresh_token', 'refresh123');
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'newtoken123' }),
    });
    const { result } = renderHook(() => useRefreshToken());
    await act(async () => {
      const token = await result.current();
      expect(token).toBe('newtoken123');
      expect(localStorage.getItem('token')).toBe('newtoken123');
    });
  });

  it('lança erro se refresh falha', async () => {
    localStorage.setItem('refresh_token', 'refresh123');
    (fetch as jest.Mock).mockResolvedValue({ ok: false });
    const { result } = renderHook(() => useRefreshToken());
    await expect(result.current()).rejects.toThrow('Refresh failed');
  });
});
