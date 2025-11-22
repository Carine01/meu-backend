import { Test, TestingModule } from '@nestjs/testing';
import { FirestoreController } from './firestore.controller';
import { FirestoreService } from './firestore.service';
import { CanActivate } from '@nestjs/common';
import { FirebaseAuthGuard } from '../firebase-auth.guard';

class MockAuthGuard implements CanActivate {
  canActivate() {
    return true;
  }
}

describe('FirestoreController', () => {
  let controller: FirestoreController;
  let service: FirestoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FirestoreController],
      providers: [
        FirestoreService,
        { provide: FirebaseAuthGuard, useClass: MockAuthGuard },
        {
          provide: require('../firebase-auth.service').FirebaseAuthService,
          useValue: { verifyToken: jest.fn().mockResolvedValue({ uid: 'test' }) },
        },
      ],
    }).compile();

    controller = module.get<FirestoreController>(FirestoreController);
    service = module.get<FirestoreService>(FirestoreService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create on service', async () => {
    const spy = jest.spyOn(service, 'create').mockResolvedValue({ id: 'abc' });
    const result = await controller.create('leads', { name: 'Teste' });
    expect(result).toEqual({ id: 'abc' });
    expect(spy).toHaveBeenCalledWith('leads', { name: 'Teste' });
  });
});

