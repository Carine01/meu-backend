import { MensagemResolverService } from '../mensagem-resolver.service';

describe('MensagemResolverService - clinicId isolation', () => {
  let service: MensagemResolverService;

  beforeEach(() => {
    service = new MensagemResolverService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have resolverMensagemPorClinica method', () => {
    expect(service.resolverMensagemPorClinica).toBeDefined();
    expect(typeof service.resolverMensagemPorClinica).toBe('function');
  });

  it('should have getPerfilPorClinica method', () => {
    expect(service.getPerfilPorClinica).toBeDefined();
    expect(typeof service.getPerfilPorClinica).toBe('function');
  });

  it('should throw error for empty clinicId in resolverMensagemPorClinica', async () => {
    await expect(service.resolverMensagemPorClinica('template', '')).rejects.toThrow('clinicId é obrigatório');
  });

  it('should throw error for empty clinicId in getPerfilPorClinica', async () => {
    await expect(service.getPerfilPorClinica('')).rejects.toThrow('clinicId é obrigatório');
  });

  // Note: Full integration test would require Firestore emulator
});
