import { useState, useEffect } from 'react';

/**
 * Hook to extract user role from JWT token stored in localStorage.
 * 
 * SECURITY NOTE: This hook performs client-side decoding only for UI purposes.
 * It does NOT verify the JWT signature or expiration. The token validation
 * must be performed on the backend for all authorization decisions.
 * 
 * This hook should only be used for:
 * - Showing/hiding UI elements based on role
 * - Client-side navigation hints
 * 
 * Never rely on this for actual access control - that must happen server-side.
 */
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
      // Note: This is NOT validating the signature - validation happens server-side
      const payload = JSON.parse(atob(parts[1]));
      setRole(payload.role || null);
    } catch (error) {
      setRole(null);
    }
  }, []);

  return role;
}
