// src/common/services/common.service.ts

import { Repository, ObjectLiteral } from 'typeorm';
import { BasicFilterQueryDto } from '../query/dtos/basic-filter-query.dto';
import { BaseHelperService } from './base-helper.service';

export class CommonService<T extends ObjectLiteral> {
    constructor(
        readonly repo: Repository<T>,
        readonly helper: BaseHelperService,
    ) { }

    async find(query?: BasicFilterQueryDto, alias = 'entity'): Promise<T[]> {
        const defaultAlias = alias ?? this.repo.metadata.name.toLowerCase();
        const qb = this.repo.createQueryBuilder(defaultAlias);
        if (query) {
            this.helper.buildFilterQuery(qb, query, alias);
        }
        return qb.getMany();
    }
}
