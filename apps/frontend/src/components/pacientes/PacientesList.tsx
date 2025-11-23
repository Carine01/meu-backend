import React, { useEffect, useState } from 'react';
import { fetchPacientes } from '../../api/pacientes';

export function PacientesList({ clinicId }: { clinicId: string }) {
  const [pacientes, setPacientes] = useState<any[]>([]);

  useEffect(() => {
    fetchPacientes(clinicId).then(setPacientes);
  }, [clinicId]);

  return (
    <ul>
      {pacientes.map(p => (
        <li key={p.id}>{p.nome}</li>
      ))}
    </ul>
  );
}
