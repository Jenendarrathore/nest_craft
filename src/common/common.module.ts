// src/common/common.module.ts

import { Module } from '@nestjs/common';
import { BaseHelperService } from './services/base-helper.service';

@Module({
  providers: [BaseHelperService],
  exports: [BaseHelperService], // ✅ Important
})
export class CommonModule {}
