import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService, PerfilData } from './profile.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as admin from 'firebase-admin';

// Mock do Firestore
const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  startAfter: jest.fn().mockReturnThis(),
};

jest.mock('firebase-admin', () => ({
  firestore: jest.fn(() => mockFirestore),
}));

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileService],
    }).compile();

    service = module.get<ProfileService>(ProfileService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('getPerfilData', () => {
    it('deve buscar perfil existente', async () => {
      const mockData: PerfilData = {
        clinicId: 'elevare-01',
        clinica_nome: 'Clínica Teste',
        profissional_nome: 'Dr. João Silva',
      };

      mockFirestore.get.mockResolvedValue({
        exists: true,
        data: () => mockData,
      });

      const result = await service.getPerfilData('elevare-01');

      expect(result).toEqual(mockData);
      expect(mockFirestore.collection).toHaveBeenCalledWith('profiles');
      expect(mockFirestore.doc).toHaveBeenCalledWith('elevare-01');
    });

    it('deve retornar null se perfil não existir', async () => {
      mockFirestore.get.mockResolvedValue({
        exists: false,
      });

      const result = await service.getPerfilData('inexistente');

      expect(result).toBeNull();
    });

    it('deve lançar erro se clinicId for vazio', async () => {
      await expect(service.getPerfilData('')).rejects.toThrow(HttpException);
      await expect(service.getPerfilData('')).rejects.toThrow('clinicId é obrigatório');
    });
  });

  describe('savePerfilData', () => {
    it('deve salvar perfil com sucesso', async () => {
      const dados: PerfilData = {
        clinicId: 'elevare-01',
        clinica_nome: 'Clínica Teste',
        profissional_nome: 'Dr. João Silva',
      };

      mockFirestore.set.mockResolvedValue({});

      const result = await service.savePerfilData(dados);

      expect(result.status).toBe('success');
      expect(result.message).toBe('Perfil salvo com sucesso!');
      expect(result.timestamp).toBeDefined();
      expect(mockFirestore.set).toHaveBeenCalled();
    });

    it('deve rejeitar dados inválidos', async () => {
      await expect(service.savePerfilData(null as any)).rejects.toThrow(
        'Dados inválidos: deve ser um objeto',
      );
    });

    it('deve rejeitar se clinicId estiver ausente', async () => {
      const dadosSemId = {
        clinica_nome: 'Teste',
      } as any;

      await expect(service.savePerfilData(dadosSemId)).rejects.toThrow(
        'clinicId é obrigatório',
      );
    });

    it('deve rejeitar dados muito grandes', async () => {
      const dadosGrandes: PerfilData = {
        clinicId: 'elevare-01',
        clinica_nome: 'a'.repeat(1000001), // Mais de 1MB
      };

      await expect(service.savePerfilData(dadosGrandes)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('limparPerfilData', () => {
    it('deve inativar perfil (soft delete)', async () => {
      mockFirestore.get.mockResolvedValue({
        exists: true,
      });
      mockFirestore.update.mockResolvedValue({});

      const result = await service.limparPerfilData('elevare-01');

      expect(result.status).toBe('success');
      expect(result.message).toBe('Perfil limpo com sucesso!');
      expect(mockFirestore.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ativo: false,
        }),
      );
    });

    it('deve lançar erro se perfil não existir', async () => {
      mockFirestore.get.mockResolvedValue({
        exists: false,
      });

      await expect(service.limparPerfilData('inexistente')).rejects.toThrow(
        'Perfil não encontrado',
      );
    });
  });

  describe('deletarPerfilData', () => {
    it('deve deletar perfil permanentemente', async () => {
      mockFirestore.delete.mockResolvedValue({});

      const result = await service.deletarPerfilData('elevare-01');

      expect(result.status).toBe('success');
      expect(result.message).toBe('Perfil deletado com sucesso!');
      expect(mockFirestore.delete).toHaveBeenCalled();
    });
  });

  describe('exportarPerfilData', () => {
    it('deve exportar perfil com metadata', async () => {
      const mockData: PerfilData = {
        clinicId: 'elevare-01',
        clinica_nome: 'Clínica Y',
      };

      mockFirestore.get.mockResolvedValue({
        exists: true,
        data: () => mockData,
      });

      const exportado = await service.exportarPerfilData('elevare-01');

      expect(exportado.dados).toEqual(mockData);
      expect(exportado.versao).toBe('1.0');
      expect(exportado.exportado_em).toBeDefined();
      expect(exportado.format).toBe('elevare-profile-export');
    });

    it('deve lançar erro se perfil não existir', async () => {
      mockFirestore.get.mockResolvedValue({
        exists: false,
      });

      await expect(service.exportarPerfilData('inexistente')).rejects.toThrow(
        'Perfil não encontrado',
      );
    });
  });

  describe('listarPerfis', () => {
    it('deve listar perfis ativos', async () => {
      const mockPerfis = [
        { clinicId: 'clinic-1', clinica_nome: 'Clínica 1' },
        { clinicId: 'clinic-2', clinica_nome: 'Clínica 2' },
      ];

      const mockSnapshot = {
        forEach: jest.fn((callback) => {
          mockPerfis.forEach((perfil) =>
            callback({ data: () => perfil }),
          );
        }),
      };

      mockFirestore.get.mockResolvedValue(mockSnapshot);

      const result = await service.listarPerfis(20);

      expect(result).toHaveLength(2);
      expect(result[0].clinicId).toBe('clinic-1');
      expect(mockFirestore.where).toHaveBeenCalledWith('ativo', '!=', false);
      expect(mockFirestore.limit).toHaveBeenCalledWith(20);
    });
  });
});

