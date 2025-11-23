export async function fetchPacientes(clinicId: string) {
  const res = await fetch('/api/pacientes', {
    headers: { 'x-clinic-id': clinicId },
  });
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  
  return res.json();
}
