// src/internal-test/internal-test.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseHelperService } from 'src/common/base/base-helper.service';
import { Repository } from 'typeorm';
import { InternalTestEntity } from '../entities/internal-test.entity';
import { BasicFilterQueryDto, SoftDeleteFilter } from 'src/common/query/dtos/basic-filter-query.dto';

@Injectable()
export class InternalTestService {
  constructor(
    @InjectRepository(InternalTestEntity)
    private readonly repo: Repository<InternalTestEntity>,
    private readonly helper: BaseHelperService,
  ) { }

  async runTest() {
    const qb = this.repo.createQueryBuilder('internal_test');

    const query: BasicFilterQueryDto = {
      // ✅ Nested filters + $or + $and logic
      filters: {
        $and: [{
          // name: { $containsi: 'john' },
          $or: [
            { age: { $lt: 25 } },
            { isActive: { $eq: true } },
          ],
          $and: [
            { status: { $in: ['active', 'draft'] } },
            { bio: { $notContainsi: 'retired' } },
          ],
          createdAt: { $between: ['2023-01-01', '2026-01-01'] },
        }]
      },

      // ✅ Soft delete filtering
      showSoftDeleted: SoftDeleteFilter.INCLUSIVE, // Only non-deleted

      // ✅ Sorting
      sort: 'createdAt:desc,name:asc',

      // ✅ Field projection (select only these fields)
      fields: ['id', 'name', 'email', 'age', 'status', 'createdAt'],

      // ✅ Group by columns (if supported in your logic)
      // groupBy: ['status', 'isActive'],

      // ✅ Populate relations (if your entity has any)
      // populate: ['user'],

      // ✅ Populate media fields (e.g., avatar, coverImage)
      // populateMedia: ['avatar', 'coverImage'],

      // ✅ Populate grouping toggle (used for relational groups)
      // populateGroup: true,

      // ✅ Group-level filters (used if you group results by some key and want to filter those groups)
      // groupFilter: {
      //   filters: {
      //     status: { $ne: 'archived' },
      //   },
      //   sort: 'age:desc',
      // },

      // ✅ Locale filtering (if using i18n)
      // locale: 'en',

      // ✅ Content status (if you support workflows like draft/published/etc.)
      // status: 'published',

      // ✅ Pagination
      limit: 100,
      offset: 0

      // page: 1,
      // itemsPerPage: 20,
    };


    this.helper.buildFilterQuery(qb, query, 'internal_test');

    console.log(qb.getSql());
    return qb.getMany();
  }
}