import { BloqueiosService } from '../bloqueios.service';
describe('BloqueiosService clinic filter', () => {
  it('returns bloqueios only for clinic', async () => {
    const find = jest.fn().mockResolvedValue([{ id: 'b1', clinicId: 'C1' }]);
    const repo: any = { find };
    const svc = new BloqueiosService(repo);
    const res = await svc.listForClinic('C1');
    expect(find).toHaveBeenCalledWith({ where: { clinicId: 'C1' }});
    expect(res[0].clinicId).toBe('C1');
  });
});
