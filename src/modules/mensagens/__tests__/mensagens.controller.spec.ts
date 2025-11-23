import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MensagensController } from '../mensagens.controller';
import { MensagensService } from '../mensagens.service';

describe('MensagensController', () => {
  let controller: MensagensController;
  let serviceMock: any;

  beforeEach(async () => {
    serviceMock = {
      findAllByClinic: jest.fn().mockResolvedValue([
        { id: 1, clinicId: 'CLINICA_1', texto: 'Test message' },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MensagensController],
      providers: [
        {
          provide: MensagensService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<MensagensController>(MensagensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return messages for valid clinicId', async () => {
    const result = await controller.findAll('CLINICA_1');
    expect(result).toHaveLength(1);
    expect(result[0].clinicId).toBe('CLINICA_1');
    expect(serviceMock.findAllByClinic).toHaveBeenCalledWith('CLINICA_1');
  });

  it('should throw BadRequestException when clinicId is missing', async () => {
    await expect(controller.findAll(undefined as any)).rejects.toThrow(BadRequestException);
    await expect(controller.findAll(undefined as any)).rejects.toThrow('Header x-clinic-id é obrigatório');
  });

  it('should throw BadRequestException when clinicId is empty string', async () => {
    await expect(controller.findAll('')).rejects.toThrow(BadRequestException);
    await expect(controller.findAll('')).rejects.toThrow('Header x-clinic-id é obrigatório');
  });

  it('should throw BadRequestException when clinicId is whitespace only', async () => {
    await expect(controller.findAll('   ')).rejects.toThrow(BadRequestException);
    await expect(controller.findAll('   ')).rejects.toThrow('Header x-clinic-id é obrigatório');
  });

  it('should call service with trimmed clinicId', async () => {
    await controller.findAll('CLINICA_1');
    expect(serviceMock.findAllByClinic).toHaveBeenCalledWith('CLINICA_1');
  });

  it('should accept valid clinicId with alphanumeric, underscore and hyphen', async () => {
    await controller.findAll('CLINIC_123-ABC');
    expect(serviceMock.findAllByClinic).toHaveBeenCalledWith('CLINIC_123-ABC');
  });

  it('should throw BadRequestException for clinicId with special characters', async () => {
    await expect(controller.findAll('CLINIC@123')).rejects.toThrow(BadRequestException);
    await expect(controller.findAll('CLINIC@123')).rejects.toThrow('formato inválido');
  });

  it('should throw BadRequestException for clinicId exceeding 50 characters', async () => {
    const longClinicId = 'A'.repeat(51);
    await expect(controller.findAll(longClinicId)).rejects.toThrow(BadRequestException);
    await expect(controller.findAll(longClinicId)).rejects.toThrow('formato inválido');
  });

  it('should accept clinicId with exactly 50 characters', async () => {
    const maxLengthClinicId = 'A'.repeat(50);
    await controller.findAll(maxLengthClinicId);
    expect(serviceMock.findAllByClinic).toHaveBeenCalledWith(maxLengthClinicId);
  });
});
