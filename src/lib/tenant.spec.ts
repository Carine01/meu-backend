import { Test, TestingModule } from '@nestjs/testing';
import { applyClinicIdFilter, validateClinicId, extractClinicId } from './tenant';
import { SelectQueryBuilder } from 'typeorm';

describe('Tenant Utilities', () => {
  describe('applyClinicIdFilter', () => {
    it('should apply clinicId filter to query builder', () => {
      const mockQb = {
        expressionMap: {
          mainAlias: { name: 'mensagem' }
        },
        andWhere: jest.fn().mockReturnThis()
      } as unknown as SelectQueryBuilder<any>;

      const result = applyClinicIdFilter(mockQb, 'clinic-123');

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'mensagem.clinicId = :clinicId',
        { clinicId: 'clinic-123' }
      );
      expect(result).toBe(mockQb);
    });

    it('should use custom column name', () => {
      const mockQb = {
        expressionMap: {
          mainAlias: { name: 'user' }
        },
        andWhere: jest.fn().mockReturnThis()
      } as unknown as SelectQueryBuilder<any>;

      applyClinicIdFilter(mockQb, 'clinic-456', 'customClinicId');

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'user.customClinicId = :clinicId',
        { clinicId: 'clinic-456' }
      );
    });
  });

  describe('validateClinicId', () => {
    it('should pass for valid clinicId', () => {
      expect(() => validateClinicId('clinic-123')).not.toThrow();
    });

    it('should throw for undefined clinicId', () => {
      expect(() => validateClinicId(undefined)).toThrow('clinicId é obrigatório');
    });

    it('should throw for empty string', () => {
      expect(() => validateClinicId('')).toThrow('clinicId é obrigatório');
    });

    it('should throw for whitespace only', () => {
      expect(() => validateClinicId('   ')).toThrow('clinicId é obrigatório');
    });
  });

  describe('extractClinicId', () => {
    it('should extract from x-clinic-id header', () => {
      const req = {
        headers: { 'x-clinic-id': 'clinic-from-header' },
        body: {},
        query: {}
      };

      expect(extractClinicId(req)).toBe('clinic-from-header');
    });

    it('should extract from clinicid header (lowercase)', () => {
      const req = {
        headers: { 'clinicid': 'clinic-lowercase' },
        body: {},
        query: {}
      };

      expect(extractClinicId(req)).toBe('clinic-lowercase');
    });

    it('should extract from body if header not present', () => {
      const req = {
        headers: {},
        body: { clinicId: 'clinic-from-body' },
        query: {}
      };

      expect(extractClinicId(req)).toBe('clinic-from-body');
    });

    it('should extract from query params if header and body not present', () => {
      const req = {
        headers: {},
        body: {},
        query: { clinicId: 'clinic-from-query' }
      };

      expect(extractClinicId(req)).toBe('clinic-from-query');
    });

    it('should prioritize header over body and query', () => {
      const req = {
        headers: { 'x-clinic-id': 'clinic-header' },
        body: { clinicId: 'clinic-body' },
        query: { clinicId: 'clinic-query' }
      };

      expect(extractClinicId(req)).toBe('clinic-header');
    });

    it('should return undefined if clinicId not found', () => {
      const req = {
        headers: {},
        body: {},
        query: {}
      };

      expect(extractClinicId(req)).toBeUndefined();
    });
  });
});
