import { BaseFactory } from './base.factory';

export interface MockUser {
  id: string;
  email: string;
  nome: string;
  clinicId: string;
  createdAt: Date;
}

export class UserFactory extends BaseFactory<MockUser> {
  private counter = 0;

  build(overrides?: Partial<MockUser>): MockUser {
    this.counter++;
    return {
      id: `user-${this.counter}`,
      email: `user${this.counter}@example.com`,
      nome: `Test User ${this.counter}`,
      clinicId: `clinic-${this.counter}`,
      createdAt: new Date(),
      ...overrides,
    };
  }
}
