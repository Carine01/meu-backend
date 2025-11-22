import { PaymentsService } from '../payments.service';
describe('PaymentsService clinic filter', () => {
  it('returns only orders for clinic', async () => {
    const find = jest.fn().mockResolvedValue([{ id: 'o1', clinicId: 'C1' }]);
    const repo: any = { find };
    const svc = new PaymentsService(repo);
    const res = await svc.listOrdersForClinic('C1');
    expect(find).toHaveBeenCalledWith({ where: { clinicId: 'C1' }, order: { createdAt: 'DESC' }});
    expect(res[0].clinicId).toBe('C1');
  });
});
