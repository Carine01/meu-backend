import { BiService } from '../bi.service';
describe('BiService clinic isolation', () => {
  it('queries metrics for given clinicId', async () => {
    const find = jest.fn().mockResolvedValue([{ id: 'm1', clinicId: 'C1' }]);
    const repo: any = { find };
    const svc = new BiService(repo);
    const res = await svc.getReportForClinic('C1');
    expect(find).toHaveBeenCalledWith({ where: { clinicId: 'C1' }});
    expect(res[0].clinicId).toBe('C1');
  });
});
