import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { commonConfig } from 'src/common/config/common.config';

@Injectable()
export class EmailQueueProducer {
  private readonly emailQueueName: string;

  constructor(
    @Inject('EMAIL_SERVICE') private readonly client: ClientProxy,
    @Inject(commonConfig.KEY)
    private readonly config: ConfigType<typeof commonConfig>,
  ) {
    this.emailQueueName = this.config.rabbitmq.emailQueueName;

  }

  async publish(payload: {
    to: string;
    subject: string;
    type: string;
    context: Record<string, any>;
    correlationId?: string;
    // Optional retry support
    retryCount?: number;
    retryInterval?: number;

  }) {
    const message = {
    ...payload,
    retryCount: payload.retryCount ?? 3,          // Default: 3 retries
    retryInterval: payload.retryInterval ?? 2000, // Default: 2s delay
  };

    await this.client.emit(this.emailQueueName, message);
  }
}
