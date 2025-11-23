// src/services/bi.service.spec.ts
import { Test } from '@nestjs/testing';
import { BiService } from '../modules/bi/bi.service';

describe('BiService', () => {
  let service: BiService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [BiService],
    }).compile();
    service = module.get(BiService);
  });

  it('gera metrics', async () => {
    const res = await service.summary();
    expect(res).toHaveProperty('total');
  });
});
