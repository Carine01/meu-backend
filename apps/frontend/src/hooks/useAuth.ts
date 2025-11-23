import { useState } from 'react';
import { useRefreshToken } from './useRefreshToken';

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const refreshToken = useRefreshToken();

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    setToken(data.access_token);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  };

  // Exemplo de uso automático do refresh token
  const getValidToken = async () => {
    if (!token) {
      throw new Error('No token available');
    }

    try {
      // Checar expiração do token JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const bufferTime = 60000; // Refresh 1 minute before expiration

      if (expirationTime - currentTime < bufferTime) {
        // Token expired or about to expire, refresh it
        const newToken = await refreshToken();
        setToken(newToken);
        return newToken;
      }

      return token;
    } catch (e) {
      // If token is invalid or expired, try to refresh
      try {
        const newToken = await refreshToken();
        setToken(newToken);
        return newToken;
      } catch (refreshError) {
        // Refresh failed, user needs to login again
        logout();
        throw new Error('Session expired. Please login again.');
      }
    }
  };

  return { token, login, logout, getValidToken };
}
