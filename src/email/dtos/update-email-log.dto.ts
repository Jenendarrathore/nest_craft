// src/email/dto/update-email-log.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateEmailLogDto } from './create-email-log.dto';

export class UpdateEmailLogDto extends PartialType(CreateEmailLogDto) {}
