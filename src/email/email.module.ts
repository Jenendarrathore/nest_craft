import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { DirectMailService } from './services/direct-mail.service';
import { commonConfig } from 'src/common/config/common.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailLog } from './entities/email-log.entity';
import { EmailLogService } from './services/email-log.service';
import { EmailService } from './services/email.service';
import { EmailQueueListener } from './listeners/email.listener';
import { EmailQueueProducer } from './queues/email.producer';

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
    ]),
    TypeOrmModule.forFeature([EmailLog])
  ],

  controllers: [EmailQueueListener],
  providers: [EmailService, DirectMailService, EmailQueueProducer,EmailLogService],
  exports: [EmailService,EmailLogService],
})
export class EmailModule { }
