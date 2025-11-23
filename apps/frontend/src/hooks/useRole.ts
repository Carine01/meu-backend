import { useMemo } from 'react';

export function useRole() {
  const token = localStorage.getItem('token');
  // Decodifica JWT para extrair o role
  const role = useMemo(() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.roles;
    } catch (e) {
      return null;
    }
  }, [token]);
  return role;
}
