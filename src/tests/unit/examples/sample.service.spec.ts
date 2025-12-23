import { Test, TestingModule } from '@nestjs/testing';
import { UserFactory } from '../../../mocks/factories/user.factory';

describe('SampleService (Example)', () => {
  let userFactory: UserFactory;

  beforeEach(async () => {
    userFactory = new UserFactory();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Add your service here
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(userFactory).toBeDefined();
  });

  it('should create a mock user', () => {
    const user = userFactory.build();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('nome');
  });

  it('should create multiple mock users', () => {
    const users = userFactory.buildMany(5);
    expect(users).toHaveLength(5);
    expect(users[0].id).not.toBe(users[1].id);
  });
});
