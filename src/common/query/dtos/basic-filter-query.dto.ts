// src/common/query/dto/basic-filter-query.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsEnum, IsBoolean, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from './pagination-query.dto';

export enum SoftDeleteFilter {
  INCLUSIVE = 'inclusive', // include soft-deleted
  EXCLUSIVE = 'exclusive', // exclude soft-deleted
}

export class BasicFilterQueryDto extends PaginationQueryDto {
  
  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ description: 'Strapi-style nested filters', type: Object })
  filters?: Record<string, any>;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Comma-separated sort fields (e.g., "createdAt:desc,name:asc")',
    example: 'createdAt:desc,name:asc',
  })
  sort?: string;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ description: 'Fields to return', type: [String] })
  fields?: string[];

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ description: 'Fields to group by', type: [String] })
  groupBy?: string[];

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ description: 'Relations to populate', type: [String] })
  populate?: string[];

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ description: 'Media fields to populate', type: [String] })
  populateMedia?: string[];

  @IsOptional()
  @IsEnum(SoftDeleteFilter)
  @ApiPropertyOptional({
    description: 'Soft delete visibility toggle',
    enum: SoftDeleteFilter,
    default: SoftDeleteFilter.EXCLUSIVE,
  })
  showSoftDeleted?: SoftDeleteFilter;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @ApiPropertyOptional({ description: 'Whether to group populated records' })
  populateGroup?: boolean;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Nested filter for group level', type: () => BasicFilterQueryDto })
  groupFilter?: BasicFilterQueryDto;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Locale for translation-based models' })
  locale?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Content status (e.g., draft, published)' })
  status?: string;
}
