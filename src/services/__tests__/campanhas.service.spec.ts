import { CampanhasService } from '../campanhas.service';

describe('CampanhasService (clinicId)', () => {
  it('fetches only campanhas for clinic', async () => {
    const find = jest.fn().mockResolvedValue([{ id: 'c1', clinicId: 'C1' }]);
    const repo: any = { find };
    const svc = new CampanhasService(repo);
    const res = await svc.findActiveForClinic('C1');
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ where: { active: true, clinicId: 'C1' } }));
    expect(res[0].clinicId).toBe('C1');
  });
});
