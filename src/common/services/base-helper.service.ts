// src/common/base/base-helper.service.ts

import { Injectable } from '@nestjs/common';
import { Brackets, SelectQueryBuilder, WhereExpressionBuilder } from 'typeorm';
import { BasicFilterQueryDto, SoftDeleteFilter } from '../query/dtos/basic-filter-query.dto';

@Injectable()
export class BaseHelperService {
  /**
   * Apply top-level filters and soft delete visibility
   */
  buildFilterQuery(
    qb: SelectQueryBuilder<any>,
    query: BasicFilterQueryDto,
    alias = 'entity',
  ) {
    // ✅ Apply soft delete condition first
    if (query.showSoftDeleted === SoftDeleteFilter.EXCLUSIVE) {
      qb.andWhere(`${alias}.isDeleted = false`);
    }

    this.applyFilterQuery(qb, query, alias)
    this.buildSortQuery(qb, query, alias);
    this.buildFieldSelection(qb, query, alias);
    this.buildPopulateRelations(qb, query, alias);
    this.buildPaginationQuery(qb, query);

    return qb;
  }

  applyFilterQuery(qb: SelectQueryBuilder<any>, query: BasicFilterQueryDto, alias = 'entity') {
    const filters = query.filters || {};

    // if (!filters || Object.keys(filters).length === 0) return qb;
    // qb.where(new Brackets((subQb => {
    //   this._applyFiltersRecursive(subQb, filters, alias, qb);
    // })));

    if (!filters || Object.keys(filters).length === 0) return qb;

    if (filters) {
      qb.andWhere(new Brackets(whereQb => {
        this._applyFiltersRecursive(whereQb, filters, alias, qb);
      }));
    }
    return qb


  }

  private _applyFiltersRecursive(qb: WhereExpressionBuilder, filters: any, alias: string = 'entity', selectQb: SelectQueryBuilder<any>) {
    const normalizedFilters = this.normalizeObjectKeys(filters);
    console.log("normalizedFilters", normalizedFilters);

    // 🔁 $and
    if ('$and' in normalizedFilters) {
      const andItems = normalizedFilters.$and;

      for (const item of andItems) {
        qb.andWhere(new Brackets(subQb => {
          if (typeof item === 'object' && !Array.isArray(item)) {
            for (const key of Object.keys(item)) {
              const single = { [key]: item[key] };
              this._applyFiltersRecursive(subQb, single, alias, selectQb);
            }
          }
        }));
      }

      return;
    }

    // 🔁 $or
    if ('$or' in normalizedFilters) {
      const orItems = normalizedFilters.$or;

      qb.andWhere(new Brackets(subQb => {
        for (const item of orItems) {
          subQb.orWhere(new Brackets(innerQb => {
            this._applyFiltersRecursive(innerQb, item, alias, selectQb);
          }));
        }
      }));

      return;
    }

    // ✅ Field-level filters
    for (const field of Object.keys(normalizedFilters)) {
      const filterObj = normalizedFilters[field];

      if (typeof filterObj !== 'object' || Array.isArray(filterObj)) continue;

      const normalizedOperatorObj = this.normalizeObjectKeys(filterObj);
      const operatorKey = Object.keys(normalizedOperatorObj)[0];

      if (operatorKey?.startsWith('$')) {
        this.buildOperatorQuery(qb, alias, field, normalizedOperatorObj, operatorKey);
      }
    }

  }

  // private _applyFiltersRecursive(
  //   qb: WhereExpressionBuilder,
  //   filters: Record<string, any>,
  //   alias: string = 'entity',
  //   selectQb?: SelectQueryBuilder<any>,
  // ) {
  //   const normalizedFilters = this.normalizeObjectKeys(filters);

  //   // ✅ $and support
  //   if (normalizedFilters.$and) {
  //     qb.andWhere(new Brackets(andQb => {
  //       for (const andFilter of normalizedFilters.$and) {
  //         andQb.andWhere(new Brackets(subQb => {
  //           this._applyFiltersRecursive(subQb, andFilter, alias, selectQb);
  //         }));
  //       }
  //     }));
  //     return;
  //   }

  //   // ✅ $or support
  //   if (normalizedFilters.$or) {
  //     qb.andWhere(new Brackets(orQb => {
  //       for (const orFilter of normalizedFilters.$or) {
  //         orQb.orWhere(new Brackets(subQb => {
  //           this._applyFiltersRecursive(subQb, orFilter, alias, selectQb);
  //         }));
  //       }
  //     }));
  //     return;
  //   }

  //   // ✅ Field-level filters
  //   for (const field of Object.keys(normalizedFilters)) {
  //     const filterObj = normalizedFilters[field];
  //     const normalizedOperatorObj = this.normalizeObjectKeys(filterObj);

  //     const operatorKey = Object.keys(normalizedOperatorObj)[0];

  //     if (operatorKey.startsWith('$')) {
  //       this.buildOperatorQuery(qb, alias, field, normalizedOperatorObj, operatorKey);
  //     } else {
  //       // Optional: support nested field conditions
  //     }
  //   }
  // }



  private buildOperatorQuery(qb: any, alias: string, field: string, normalizedPrimaryOperatorObj: any, operator: string) {
    const uniqueFieldAlias = `${alias}_${field}_${Math.floor(Math.random() * 1000)}`;
    switch (operator) {
      case '$eq':
        qb.andWhere(`${alias}.${field} = :${uniqueFieldAlias}`, { [uniqueFieldAlias]: normalizedPrimaryOperatorObj.$eq });
        break;
      case '$eqi':
        qb.andWhere(`LOWER(${alias}.${field}) = :${uniqueFieldAlias}`, { [uniqueFieldAlias]: normalizedPrimaryOperatorObj.$eqi.toLowerCase() });
        break;
      case '$ne':
        qb.andWhere(`${alias}.${field} != :${uniqueFieldAlias}`, { [uniqueFieldAlias]: normalizedPrimaryOperatorObj.$ne });
        break;
      case '$nei':
        qb.andWhere(`LOWER(${alias}.${field}) != :${uniqueFieldAlias}`, { [uniqueFieldAlias]: normalizedPrimaryOperatorObj.$nei.toLowerCase() });
        break;
      case '$gt':
        qb.andWhere(`${alias}.${field} > :${uniqueFieldAlias}`, { [uniqueFieldAlias]: normalizedPrimaryOperatorObj.$gt });
        break;
      case '$gte':
        qb.andWhere(`${alias}.${field} >= :${uniqueFieldAlias}`, { [uniqueFieldAlias]: normalizedPrimaryOperatorObj.$gte });
        break;
      case '$lt':
        qb.andWhere(`${alias}.${field} < :${uniqueFieldAlias}`, { [uniqueFieldAlias]: normalizedPrimaryOperatorObj.$lt });
        break;
      case '$lte':
        qb.andWhere(`${alias}.${field} <= :${uniqueFieldAlias}`, { [uniqueFieldAlias]: normalizedPrimaryOperatorObj.$lte });
        break;
      case '$in':
        qb.andWhere(`${alias}.${field} IN (:...${uniqueFieldAlias})`, { [uniqueFieldAlias]: normalizedPrimaryOperatorObj.$in });
        break;
      case '$notIn':
        qb.andWhere(`${alias}.${field} NOT IN (:...${uniqueFieldAlias})`, { [uniqueFieldAlias]: normalizedPrimaryOperatorObj.$notIn });
        break;
      case '$contains':
        qb.andWhere(`${alias}.${field} LIKE :${uniqueFieldAlias}`, { [uniqueFieldAlias]: `%${normalizedPrimaryOperatorObj.$contains}%` });
        break;
      case '$notContains':
        qb.andWhere(`${alias}.${field} NOT LIKE :${uniqueFieldAlias}`, { [uniqueFieldAlias]: `%${normalizedPrimaryOperatorObj.$notContains}%` });
        break;
      case '$containsi':
        qb.andWhere(`LOWER(${alias}.${field}) LIKE :${uniqueFieldAlias}`, { [uniqueFieldAlias]: `%${normalizedPrimaryOperatorObj.$containsi.toLowerCase()}%` });
        break;
      case '$notContainsi':
        qb.andWhere(`LOWER(${alias}.${field}) NOT LIKE :${uniqueFieldAlias}`, { [uniqueFieldAlias]: `%${normalizedPrimaryOperatorObj.$notContainsi.toLowerCase()}%` });
        break;
      case '$null':
        qb.andWhere(`${alias}.${field} IS NULL`);
        break;
      case '$notNull':
        qb.andWhere(`${alias}.${field} IS NOT NULL`);
        break;
      case '$between':
        qb.andWhere(`${alias}.${field} BETWEEN :${uniqueFieldAlias}0 AND :${uniqueFieldAlias}1`, { [`${uniqueFieldAlias}0`]: normalizedPrimaryOperatorObj.$between[0], [`${uniqueFieldAlias}1`]: normalizedPrimaryOperatorObj.$between[1] });
        break;
      case '$startsWith':
        qb.andWhere(`${alias}.${field} LIKE :${uniqueFieldAlias}`, { [uniqueFieldAlias]: `${normalizedPrimaryOperatorObj.$startsWith}%` });
        break;
      case '$startsWithi':
        qb.andWhere(`LOWER(${alias}.${field}) LIKE :${uniqueFieldAlias}`, { [uniqueFieldAlias]: `${normalizedPrimaryOperatorObj.$startsWithi.toLowerCase()}%` });
        break;
      case '$endsWith':
        qb.andWhere(`${alias}.${field} LIKE :${uniqueFieldAlias}`, { [uniqueFieldAlias]: `%${normalizedPrimaryOperatorObj.$endsWith}` });
        break;
      case '$endsWithi':
        qb.andWhere(`LOWER(${alias}.${field}) LIKE :${uniqueFieldAlias}`, { [uniqueFieldAlias]: `%${normalizedPrimaryOperatorObj.$endsWithi.toLowerCase()}` });
        break;
      default:
        throw new Error(`Operator ${operator} is not supported`);
    }
  }

  private isRelationJoined(queryBuilder: SelectQueryBuilder<any>, joinProperty: string): boolean {
    return queryBuilder.expressionMap.joinAttributes.some(join => join.entityOrProperty === joinProperty);
  }
  private normalizeObjectKeys(obj: Record<string, any>): Record<string, any> {
    const normalized: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const trimmedKey = key.trim();
      const value = obj[key];

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        normalized[trimmedKey] = this.normalizeObjectKeys(value); // recurse for nested
      } else {
        normalized[trimmedKey] = value;
      }
    }
    return normalized;
  }


  // Placeholder methods to be implemented in next phases:
  buildSortQuery(qb: SelectQueryBuilder<any>, query: BasicFilterQueryDto, alias = 'entity') {
    const { sort } = query;

    if (!sort) return qb;

    const sortFields = sort.split(',');

    for (const sortField of sortFields) {
      const [field, directionRaw] = sortField.split(':');
      const direction = directionRaw?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      const fieldPath = `${alias}.${field}`;

      qb.addOrderBy(fieldPath, direction as 'ASC' | 'DESC');
    }

    return qb;
  }

  buildPaginationQuery(qb: SelectQueryBuilder<any>, query: BasicFilterQueryDto, alias = 'entity') {
    const offset = query.offset ?? 0;
    const limit = query.limit ?? 10;

    qb.skip(offset).take(limit);
    return qb;
  }

  buildPopulateRelations(qb: SelectQueryBuilder<any>, query: BasicFilterQueryDto, alias = 'entity') {
    const { populate } = query;

    if (!populate || populate.length === 0) {
      return qb;
    }

    for (const relation of populate) {
      const relationPath = `${alias}.${relation}`;

      // Check if already joined (prevents duplicates in nested filters)
      const alreadyJoined = qb.expressionMap.joinAttributes.some(
        (join: any) => join.alias === relation || join.relationPropertyPath === relationPath
      );

      if (!alreadyJoined) {
        qb.leftJoinAndSelect(relationPath, relation);
      }
    }

    return qb;;
  }

  buildGroupByQuery(qb: SelectQueryBuilder<any>, query: BasicFilterQueryDto, alias = 'entity') {
    return qb;
  }

  buildGroupFilterQuery(qb: SelectQueryBuilder<any>, query: BasicFilterQueryDto, alias = 'entity') {
    return qb;
  }

  buildFieldSelection(qb: SelectQueryBuilder<any>, query: BasicFilterQueryDto, alias = 'entity') {
    const { fields } = query;

    if (!fields || fields.length === 0) {
      return qb; // Keep default `SELECT *`
    }

    const safeFields = fields.map(field => `${alias}.${field}`);
    qb.select(safeFields);

    return qb;

  }
}
