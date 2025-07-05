import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthenticationGuard } from './iam/guards/authentication.guard';
import { RolesGuard } from './iam/guards/roles.guard';

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
  app.useGlobalGuards(new AuthenticationGuard(reflector),  new RolesGuard(reflector));

  await app.listen(port);
  console.log(`🚀 Server running at http://localhost:${port}/api`);

}
bootstrap();
