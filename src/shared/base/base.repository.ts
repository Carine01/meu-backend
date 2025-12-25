import { Logger, NotFoundException } from '@nestjs/common';
import { Repository, FindOptionsWhere } from 'typeorm';

/**
 * Base Repository Class
 * Provides common CRUD operations with built-in error handling
 * Reduces code duplication across services
 */
export abstract class BaseRepository<T extends { id: string }> {
  protected abstract readonly logger: Logger;
  protected abstract readonly repository: Repository<T>;
  protected abstract readonly entityName: string;

  /**
   * Find entity by ID or throw NotFoundException
   * @param id - Entity ID
   * @returns Found entity
   * @throws NotFoundException if entity not found
   */
  async findByIdOrFail(id: string): Promise<T> {
    const entity = await this.repository.findOne({ 
      where: { id } as FindOptionsWhere<T>
    });

    if (!entity) {
      throw new NotFoundException(`${this.entityName} ${id} não encontrado`);
    }

    return entity;
  }

  /**
   * Find entity by ID and clinicId or throw NotFoundException
   * @param id - Entity ID
   * @param clinicId - Clinic ID
   * @returns Found entity
   * @throws NotFoundException if entity not found
   */
  async findByIdAndClinicOrFail(id: string, clinicId: string): Promise<T> {
    // Type assertion is safe because we control entity structure
    const entity = await this.repository.findOne({ 
      where: { id, clinicId } as any
    });

    if (!entity) {
      throw new NotFoundException(
        `${this.entityName} ${id} não encontrado para clínica ${clinicId}`
      );
    }

    return entity;
  }

  /**
   * Update entity and save
   * @param entity - Entity to update
   * @param updates - Updates to apply
   * @returns Updated entity
   */
  async updateAndSave(entity: T, updates: Partial<T>): Promise<T> {
    Object.assign(entity, updates);
    return await this.repository.save(entity);
  }

  /**
   * Create and save entity
   * @param data - Entity data
   * @returns Created entity
   */
  async createAndSave(data: Partial<T>): Promise<T> {
    const entity = this.repository.create(data as any);
    const saved = await this.repository.save(entity);
    // TypeORM save returns T when passed single entity, T[] when passed array
    return Array.isArray(saved) ? saved[0] : saved;
  }

  /**
   * Find all entities with optional filtering
   * @param where - Optional where clause
   * @param order - Optional order by
   * @returns Array of entities
   */
  async findAll(
    where?: FindOptionsWhere<T>,
    order?: Record<string, 'ASC' | 'DESC'>
  ): Promise<T[]> {
    return await this.repository.find({
      where,
      order: order as any,
    });
  }

  /**
   * Delete entity by ID
   * @param id - Entity ID
   */
  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
    this.logger.log(`🗑️ ${this.entityName} removido: ${id}`);
  }
}
