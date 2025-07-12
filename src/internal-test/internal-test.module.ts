// src/internal-test/internal-test.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalTestEntity } from './entities/internal-test.entity';
import { InternalTestController } from './controllers/internal-test.controller';
import { InternalTestService } from './services/internal-test.service';
import { BaseHelperService } from 'src/common/services/base-helper.service';

@Module({
  imports: [TypeOrmModule.forFeature([InternalTestEntity])],
  controllers: [InternalTestController],
  providers: [InternalTestService, BaseHelperService],
})
export class InternalTestModule {}
