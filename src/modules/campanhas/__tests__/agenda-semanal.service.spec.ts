import { AgendaSemanalService } from '../agenda-semanal.service';
import { FilaService } from '../../fila/fila.service';

describe('AgendaSemanalService - clinicId isolation', () => {
  let service: AgendaSemanalService;
  let filaService: FilaService;

  beforeEach(() => {
    filaService = {} as FilaService;
    service = new AgendaSemanalService(filaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have executarAgendaDoDiaPorClinica method', () => {
    expect(service.executarAgendaDoDiaPorClinica).toBeDefined();
    expect(typeof service.executarAgendaDoDiaPorClinica).toBe('function');
  });

  it('should throw error for empty clinicId', async () => {
    await expect(service.executarAgendaDoDiaPorClinica('')).rejects.toThrow('clinicId é obrigatório');
  });

  // Note: Full integration test would require Firestore emulator
});
