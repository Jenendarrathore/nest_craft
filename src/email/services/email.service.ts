import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { DirectMailerService } from './direct-mailer.service';
import { ConfigType } from '@nestjs/config';
import { commonConfig } from 'src/common/config/common.config';

@Injectable()
export class EmailService {
  private readonly useQueue: boolean;

  constructor(
    private readonly directMailer: DirectMailerService,
    @Inject('EMAIL_SERVICE') private readonly client: ClientProxy,

    @Inject(commonConfig.KEY)
    private readonly commonConfiguration: ConfigType<typeof commonConfig>,

  ) {
    this.useQueue = this.commonConfiguration.rabbitmq.useRabbitmqEmail === 'true';
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    if (this.useQueue) {
      this.client.emit('send_otp_email', { to, otp });
    } else {
      await this.directMailer.sendOtpEmail(to, otp);
    }
  }
}
