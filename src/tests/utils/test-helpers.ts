import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

export class TestHelpers {
  static async createTestingModule(providers: any[]): Promise<TestingModule> {
    return await Test.createTestingModule({
      providers,
    }).compile();
  }

  static mockRepository<T = any>() {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
    };
  }

  static mockService<T = any>() {
    return {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
  }
}
