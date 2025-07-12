// src/common/base/base.service.ts

import { DeepPartial, ObjectLiteral, Repository } from 'typeorm';
import { BasicFilterQueryDto } from '../query/dtos/basic-filter-query.dto';

export abstract class BaseService<T extends ObjectLiteral> {
  protected alias = 'entity'; // Can be overridden in child services

  constructor(
        readonly repo: Repository<T>,
  ) {}

  /**
   * Find all entities based on filter query
   */
  async findAll(query: BasicFilterQueryDto) {
    // To be implemented in full later using BaseServiceHelper
    return [[], 0];
  }

  /**
   * Find one entity by ID (with optional population logic)
   */
  async findOne(id: string, query?: BasicFilterQueryDto) {
    return null;
  }

  /**
   * Create a new entity
   */
  async create(data: DeepPartial<T>) {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  /**
   * Update an existing entity
   */
  async update(id: string, data: Partial<T>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  /**
   * Soft delete an entity (or override for hard delete)
   */
  async delete(id: string) {
    await this.repo.softDelete(id);
  }

  /**
   * Restore a soft-deleted entity
   */
  async restore(id: string) {
    await this.repo.restore(id);
  }

  /**
   * Count entities based on filters
   */
  async count(query: BasicFilterQueryDto) {
    return 0;
  }

  /**
   * Aggregate data using groupBy/filter/query
   */
  async aggregate(query: BasicFilterQueryDto) {
    return [];
  }
}
