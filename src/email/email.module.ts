import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { EmailController } from './controllers/email.controller';
import { EmailService } from './services/email.service';
import { DirectMailerService } from './services/direct-mailer.service';
import { commonConfig } from 'src/common/config/common.config';

@Module({
  imports: [
    ConfigModule,
    ConfigModule.forFeature(commonConfig),
    ClientsModule.registerAsync([
      {
        name: 'EMAIL_SERVICE',
        imports: [ConfigModule, ConfigModule.forFeature(commonConfig)],
        inject: [commonConfig.KEY],
        useFactory: (config: ConfigType<typeof commonConfig>) => (
          {
            transport: Transport.RMQ,
            options: {
              urls: [config.rabbitmq.rabbitmqUrl],        // ✅ always a string[]
              queue: config.rabbitmq.emailQueueName,         // ✅ always a string
              queueOptions: {
                durable: true,
              },
            }
          }),
      }
    ])
  ],

  controllers: [EmailController],
  providers: [EmailService, DirectMailerService],
  exports: [EmailService],
})
export class EmailModule { }
