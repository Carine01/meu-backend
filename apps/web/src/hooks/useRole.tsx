import { useState, useEffect } from 'react';

export function useRole(): string | null {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setRole(null);
      return;
    }

    try {
      // JWT tokens have 3 parts separated by dots: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        setRole(null);
        return;
      }

      // Decode the payload (second part)
      const payload = JSON.parse(atob(parts[1]));
      setRole(payload.role || null);
    } catch (error) {
      setRole(null);
    }
  }, []);

  return role;
}
