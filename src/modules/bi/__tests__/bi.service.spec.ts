import { BiService } from '../bi.service';

describe('BiService - clinicId isolation', () => {
  let service: BiService;

  beforeEach(() => {
    service = new BiService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have getReportForClinic method', () => {
    expect(service.getReportForClinic).toBeDefined();
    expect(typeof service.getReportForClinic).toBe('function');
  });

  it('should throw error for empty clinicId', async () => {
    await expect(service.getReportForClinic('')).rejects.toThrow('clinicId é obrigatório');
  });

  // Note: Full integration test would require Firestore emulator
  // This is a structural test to ensure method exists
});
