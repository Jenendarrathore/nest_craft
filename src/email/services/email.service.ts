// src/email/services/email.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { DirectMailService } from './direct-mail.service';
import { EmailQueueProducer } from '../queues/email.producer';

export interface EmailSendPayload {
    to: string;
    subject: string;
    type: string; // template name without `.hbs`
    context: Record<string, any>;
    correlationId?: string;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly useQueue = process.env.USE_RABBITMQ_EMAIL === 'true';

    constructor(
        private readonly directMailer: DirectMailService,
        private readonly emailQueueProducer: EmailQueueProducer
    ) { }

    async sendEmail(payload: EmailSendPayload): Promise<void> {
        const { to, subject, type, context, correlationId } = payload;

        if (this.useQueue) {
            this.logger.log(`📤 Publishing email to RabbitMQ: ${to} [${type}]`);
            await this.emailQueueProducer.publish({
                to,
                subject,
                type,
                context,
                correlationId,
            });
        } else {
            this.logger.log(`📧 Sending email directly (no queue): ${to} [${type}]`);
            await this.directMailer.send({
                to,
                subject,
                type,
                context,
                correlationId,
            });
        }
    }

}
