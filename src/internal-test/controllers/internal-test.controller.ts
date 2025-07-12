// src/internal-test/internal-test.controller.ts

import { Controller, Get } from '@nestjs/common';
import { InternalTestService } from '../services/internal-test.service';
import { Public } from 'src/iam/decorators/public.decorator';

@Controller('internal-test')
export class InternalTestController {
    constructor(private readonly service: InternalTestService) { }

    @Public()
    @Get()
    runTest() {
        return this.service.runTest();
    }
}
