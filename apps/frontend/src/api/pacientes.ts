export async function fetchPacientes(clinicId: string) {
  if (!clinicId || clinicId.trim() === '') {
    throw new Error('clinicId is required');
  }
  
  const res = await fetch('/api/pacientes', {
    headers: { 'x-clinic-id': clinicId },
  });
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  
  return res.json();
}
