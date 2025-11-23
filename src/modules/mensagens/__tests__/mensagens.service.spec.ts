import { MensagensService } from '../mensagens.service';

describe('MensagensService', () => {
  let service: MensagensService;
  let repoMock: any;
  let prometheusMock: any;

  beforeEach(() => {
    repoMock = { 
      findAllByClinic: jest.fn().mockResolvedValue([
        { id: 1, clinicId: 'CLINICA_1', texto: 'Mensagem 1' },
        { id: 2, clinicId: 'CLINICA_1', texto: 'Mensagem 2' }
      ]) 
    };
    prometheusMock = { incrementMensagensRequests: jest.fn() };
    service = new MensagensService(repoMock, prometheusMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should only return data for the correct clinicId', async () => {
    const data = await service.findAllByClinic('CLINICA_1');
    expect(data.every(d => d.clinicId === 'CLINICA_1')).toBe(true);
    expect(prometheusMock.incrementMensagensRequests).toHaveBeenCalledWith('CLINICA_1');
  });

  it('should call repository with correct clinicId', async () => {
    await service.findAllByClinic('CLINICA_1');
    expect(repoMock.findAllByClinic).toHaveBeenCalledWith('CLINICA_1');
  });

  it('should increment Prometheus counter on each request', async () => {
    await service.findAllByClinic('CLINICA_1');
    expect(prometheusMock.incrementMensagensRequests).toHaveBeenCalledTimes(1);
    expect(prometheusMock.incrementMensagensRequests).toHaveBeenCalledWith('CLINICA_1');
  });

  it('should return empty array when no messages exist', async () => {
    repoMock.findAllByClinic.mockResolvedValue([]);
    const data = await service.findAllByClinic('CLINICA_2');
    expect(data).toEqual([]);
    expect(prometheusMock.incrementMensagensRequests).toHaveBeenCalledWith('CLINICA_2');
  });

  it('should isolate data by clinicId', async () => {
    repoMock.findAllByClinic.mockResolvedValue([
      { id: 3, clinicId: 'CLINICA_2', texto: 'Mensagem 3' }
    ]);
    
    const data = await service.findAllByClinic('CLINICA_2');
    expect(data.length).toBe(1);
    expect(data[0].clinicId).toBe('CLINICA_2');
  });

  it('should handle repository errors gracefully', async () => {
    repoMock.findAllByClinic.mockRejectedValue(new Error('Database error'));
    
    await expect(service.findAllByClinic('CLINICA_1')).rejects.toThrow('Database error');
    expect(prometheusMock.incrementMensagensRequests).toHaveBeenCalledWith('CLINICA_1');
  });
});
