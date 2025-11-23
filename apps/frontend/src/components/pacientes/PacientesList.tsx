import React, { useEffect, useState } from 'react';
import { fetchPacientes } from '../../api/pacientes';

interface Paciente {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
}

export function PacientesList({ clinicId }: { clinicId: string }) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const abortController = new AbortController();
    
    setLoading(true);
    setError(null);
    
    fetchPacientes(clinicId)
      .then((data) => {
        if (!abortController.signal.aborted) {
          setPacientes(data);
        }
      })
      .catch((err) => {
        if (!abortController.signal.aborted) {
          console.error('Error fetching pacientes:', err);
          setError('Failed to load pacientes. Please try again.');
        }
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [clinicId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <ul>
      {pacientes.map(p => (
        <li key={p.id}>{p.nome}</li>
      ))}
    </ul>
  );
}
