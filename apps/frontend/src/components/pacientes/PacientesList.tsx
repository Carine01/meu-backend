import React, { useEffect, useState } from 'react';
import { fetchPacientes } from '../../api/pacientes';

export function PacientesList({ clinicId }: { clinicId: string }) {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPacientes(clinicId)
      .then(setPacientes)
      .catch((err) => {
        console.error('Error fetching pacientes:', err);
        setError('Failed to load pacientes. Please try again.');
      });
  }, [clinicId]);

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
