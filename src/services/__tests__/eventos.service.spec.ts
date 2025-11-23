import { EventosService } from '../eventos.service';

describe('EventosService (clinicId)', () => {
  it('applies clinicId filter', async () => {
    const getMany = jest.fn().mockResolvedValue([{ id: 'e1', clinicId: 'C1' }]);
    const qb = { orderBy: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(), getMany, expressionMap: { mainAlias: { name: 'e' } } };
    const repo: any = { createQueryBuilder: jest.fn().mockReturnValue(qb) };
    const svc = new EventosService(repo);
    const res = await svc.listByClinic('C1');
    expect(getMany).toHaveBeenCalled();
    expect(res[0].clinicId).toBe('C1');
  });
});
