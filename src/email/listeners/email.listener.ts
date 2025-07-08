import { Controller, Inject, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { DirectMailService } from '../services/direct-mail.service';
import { EmailLogService } from '../services/email-log.service';

const DEFAULT_QUEUE = process.env.EMAIL_QUEUE_NAME || 'email_queue_nest_craft';
const DLQ_QUEUE = process.env.EMAIL_QUEUE_DLQ_NAME || 'email_queue_nest_craft_dlq';

@Controller()
export class EmailQueueListener {
  private readonly logger = new Logger(EmailQueueListener.name);

  constructor(
    private readonly directMailer: DirectMailService,
    private readonly emailLogService: EmailLogService,
  ) { }

  @EventPattern(DEFAULT_QUEUE)
  async handleEmailQueue(
    @Payload()
    data: {
      to: string;
      subject: string;
      type: string;
      context: Record<string, any>;
      correlationId?: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    try {
      this.logger.log(`📥 Received email job for ${data.to}`);
      await this.directMailer.send(data);
      channel.ack(message); // ✅ Acknowledge successful processing
    } catch (err) {
      this.logger.error(`❌ Failed to send email to ${data.to}: ${err.message}`);
      channel.nack(message, false, false); // ✅ Push to DLQ
    }
  }

  @EventPattern(DLQ_QUEUE)
  async handleDeadLetter(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    this.logger.error(`📛 Moved to DLQ: ${JSON.stringify(data)}`);

    // TODO: Optional - Save to DB or alert system
    try {
      await this.emailLogService.create({
        to: data.to,
        subject: data.subject,
        type: data.type,
        context: data.context,
        status: 'FAILED',
        error: 'Exceeded retry attempts',
        correlationId: data.correlationId,
        retryReason: 'DLQ_RETRY_EXCEEDED',
        sentAt: null
      });
    } catch (err) {
      this.logger.error(`❌ Failed to log DLQ email: ${err.message}`);
    }

    channel.ack(message); // Acknowledge that we’ve handled it (even if only logging)
  }
}
