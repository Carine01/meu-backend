export async function fetchPacientes(clinicId: string) {
  const res = await fetch('/api/pacientes', {
    headers: { 'x-clinic-id': clinicId },
  });
  return res.json();
}
