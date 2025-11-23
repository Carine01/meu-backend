import React from 'react';
import { useRole } from '../hooks/useRole';

export const AdminPanel = () => {
  const roles = useRole();
  
  if (!roles || !roles.includes('admin')) {
    return <div>Acesso negado</div>;
  }
  
  return <div>Bem-vindo ao painel admin!</div>;
};
