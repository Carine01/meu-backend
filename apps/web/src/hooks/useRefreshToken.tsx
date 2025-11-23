import { useCallback } from 'react';

export function useRefreshToken() {
  return useCallback(async (): Promise<string> => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Refresh failed');
    }

    const data = await response.json();
    const newToken = data.access_token;
    
    localStorage.setItem('token', newToken);
    
    return newToken;
  }, []);
}
