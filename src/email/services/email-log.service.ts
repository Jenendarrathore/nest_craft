import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailLog } from '../entities/email-log.entity';
import { CreateEmailLogDto } from '../dtos/create-email-log.dto';
import { UpdateEmailLogDto } from '../dtos/update-email-log.dto';

@Injectable()
export class EmailLogService {
    private readonly logger = new Logger(EmailLogService.name);

    constructor(
        @InjectRepository(EmailLog)
        private readonly emailLogRepo: Repository<EmailLog>,
    ) { }

    async create(data: CreateEmailLogDto) {
        const log = this.emailLogRepo.create(data);
        return await this.emailLogRepo.save(log);
    }

    async update(id: string, updates: UpdateEmailLogDto) {
        const emailLog = await this.emailLogRepo.update(id, updates);
        return emailLog
    }
}
