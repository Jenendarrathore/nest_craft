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
  }) {
    await this.client.emit(this.emailQueueName, payload);
  }
}
