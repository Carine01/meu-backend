import { MensagensService } from '../mensagens.service';

describe('MensagensService (clinicId filter)', () => {
  it('applies clinicId filter via QueryBuilder', async () => {
    const getMany = jest.fn().mockResolvedValue([{ id: 'm1', clinicId: 'C1' }]);
    const qb = {
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany,
      expressionMap: { mainAlias: { name: 'm' } }
    };
    const repo: any = { createQueryBuilder: jest.fn().mockReturnValue(qb) };
    const svc = new MensagensService(repo);
    const res = await svc.findAllForClinic('C1');
    expect(getMany).toHaveBeenCalled();
    expect(res[0].clinicId).toBe('C1');
  });
});
