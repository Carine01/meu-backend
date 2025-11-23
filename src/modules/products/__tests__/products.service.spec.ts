import { ProductsService } from '../products.service';
import { Product } from '../product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let repoMock: any;
  let prometheusMock: any;

  beforeEach(() => {
    repoMock = {
      findAll: jest.fn().mockResolvedValue([{ id: '1', name: 'P1', price: 10 }]),
      create: jest.fn().mockResolvedValue({ id: '2', name: 'P2', price: 20 }),
    };
    prometheusMock = { incrementProductRequests: jest.fn() };
    service = new ProductsService(repoMock, prometheusMock);
  });

  it('should list all products', async () => {
    const products = await service.findAll();
    expect(products.length).toBe(1);
    expect(prometheusMock.incrementProductRequests).toHaveBeenCalled();
  });

  it('should create product', async () => {
    const product: Product = { name: 'P2', price: 20 };
    const result = await service.create(product);
    expect(result.name).toBe('P2');
    expect(prometheusMock.incrementProductRequests).toHaveBeenCalled();
  });
});
