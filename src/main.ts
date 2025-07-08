import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthenticationGuard } from './iam/guards/authentication.guard';
import { RolesGuard } from './iam/guards/roles.guard';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  )

  const config = new DocumentBuilder()
    .setTitle('nest-craft API')
    .setDescription('API documentation for the nest-craft boilerplate')
    .setVersion('1.0')
    .setExternalDoc('Postman Collection', '/docs-json')
    .addBearerAuth(
      {
        description: 'Enter JWT token like: Bearer <token>',
        name: 'Authorization',
        bearerFormat: 'JWT', // 🟢 JWT, not Bearer
        scheme: 'bearer',     // 🟢 lowercase 'bearer' (required)
        type: 'http',
        in: 'header',         // 🟢 lowercase 'header' (required)
      },
      'jwt', // The key name (used below in @ApiBearerAuth)
    )
    .build();


  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api', app, document)

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new AuthenticationGuard(reflector), new RolesGuard(reflector));

  const rabbitUrl = configService.get<string>('RABBITMQ_URL');
  const emailQueueName = configService.get<string>('EMAIL_QUEUE_NAME');
  const emailQueueDlqName =  configService.get<string>('EMAIL_QUEUE_DLQ_NAME');

  if (!rabbitUrl || !emailQueueName) {
    throw new Error('RabbitMQ configuration is missing in .env');
  }

  //
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: emailQueueName,
      queueOptions: {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': '', // default exchange
          'x-dead-letter-routing-key': emailQueueDlqName, // fallback queue
        },
      },

    },
  });

  await app.startAllMicroservices();

  await app.listen(port);
  console.log(`🚀 Server running at http://localhost:${port}/api`);

}
bootstrap();
