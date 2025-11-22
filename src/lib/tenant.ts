// src/lib/tenant.ts
import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';

/**
 * Aplica filtro de clinicId em QueryBuilder TypeORM
 * 
 * @param qb - QueryBuilder TypeORM
 * @param clinicId - ID da clínica para filtrar
 * @param column - Nome da coluna (padrão: 'clinicId')
 * @returns QueryBuilder com filtro aplicado
 * 
 * @example
 * const qb = this.repo.createQueryBuilder('mensagem');
 * applyClinicIdFilter(qb, 'clinic-123');
 * const results = await qb.getMany();
 */
export function applyClinicIdFilter<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  clinicId: string,
  column = 'clinicId'
): SelectQueryBuilder<T> {
  const alias = qb.expressionMap.mainAlias!.name;
  return qb.andWhere(`${alias}.${column} = :clinicId`, { clinicId });
}

/**
 * Valida se clinicId está presente e é válido
 * @throws Error se inválido
 */
export function validateClinicId(clinicId: string | undefined): asserts clinicId is string {
  if (!clinicId || clinicId.trim() === '') {
    throw new Error('clinicId é obrigatório');
  }
}

/**
 * Extrai clinicId do header ou body da requisição
 * 
 * @param req - Request object (Express/NestJS)
 * @returns clinicId extraído ou undefined
 * 
 * @example
 * const clinicId = extractClinicId(req);
 * validateClinicId(clinicId);
 */
export function extractClinicId(req: any): string | undefined {
  // Tentar extrair do header primeiro
  const headerClinicId = req.headers['x-clinic-id'] || req.headers['clinicid'];
  if (headerClinicId) return headerClinicId;

  // Tentar extrair do body
  if (req.body?.clinicId) return req.body.clinicId;

  // Tentar extrair do query params
  if (req.query?.clinicId) return req.query.clinicId;

  return undefined;
}
