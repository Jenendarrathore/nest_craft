# 📧 Complete Email Queue Flow with RabbitMQ in NestJS

This guide provides a full working example of how to send OTP emails using RabbitMQ queues in NestJS. It includes code samples and local testing with MailDev.

---

## 🧱 System Architecture

```
Controller (e.g. AuthController)
      |
      v
EmailService.sendOtp(to, otp)
      |
      ├── If queue enabled:
      |     client.emit('send_otp_email', { to, otp })  -> RabbitMQ
      |       └── EmailController listens for this event
      |             └── DirectMailerService.sendOtpEmail()
      |
      └── Else:
            └── DirectMailerService.sendOtpEmail()
```

---

## ⚙️ Configuration (.env)

```env
USE_RABBITMQ_EMAIL=true
RABBITMQ_URL=amqp://localhost:5672
EMAIL_QUEUE_NAME=email_queue

SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM_EMAIL=noreply@example.com
```

---

## 📁 Folder Structure

```
src/
├── email/
│   ├── email.module.ts
│   ├── email.service.ts
│   ├── direct-mailer.service.ts
│   ├── controllers/
│   │   └── email.controller.ts
│   └── services/
│       └── templates/
│           └── otp.hbs
```

---

## 🧩 Code

### 📦 `email.module.ts`

```ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { DirectMailerService } from './direct-mailer.service';
import { EmailController } from './controllers/email.controller';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'EMAIL_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get('RABBITMQ_URL')],
            queue: config.get('EMAIL_QUEUE_NAME'),
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  providers: [EmailService, DirectMailerService],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
```

---

### 📧 `email.service.ts`

```ts
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { DirectMailerService } from './direct-mailer.service';

@Injectable()
export class EmailService {
  private readonly useQueue: boolean;

  constructor(
    @Inject('EMAIL_SERVICE') private readonly client: ClientProxy,
    private readonly configService: ConfigService,
    private readonly directMailer: DirectMailerService,
  ) {
    this.useQueue = configService.get('USE_RABBITMQ_EMAIL') === 'true';
  }

  async sendOtp(to: string, otp: string) {
    if (this.useQueue) {
      this.client.emit('send_otp_email', { to, otp });
    } else {
      await this.directMailer.sendOtpEmail(to, otp);
    }
  }
}
```

---

### 📨 `direct-mailer.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as hbs from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class DirectMailerService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false,
    });
  }

  async sendOtpEmail(to: string, otp: string) {
    const templatePath =
      process.env.NODE_ENV === 'production'
        ? join(__dirname, 'templates', 'otp.hbs')
        : join(__dirname, '..', '..', 'email', 'services', 'templates', 'otp.hbs');

    const htmlTemplate = readFileSync(templatePath, 'utf-8');
    const compiledHtml = hbs.compile(htmlTemplate)({ otp });

    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM_EMAIL'),
      to,
      subject: 'Your OTP Code',
      html: compiledHtml,
    });
  }
}
```

---

### 🎯 `email.controller.ts`

```ts
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { DirectMailerService } from '../direct-mailer.service';

@Controller()
export class EmailController {
  constructor(private readonly directMailer: DirectMailerService) {}

  @EventPattern('send_otp_email')
  async handleOtpEmail(data: { to: string; otp: string }) {
    await this.directMailer.sendOtpEmail(data.to, data.otp);
  }
}
```

---

## 📩 Example Template (`otp.hbs`)

```hbs
<!DOCTYPE html>
<html>
  <body>
    <p>Your OTP is: <strong>{{otp}}</strong></p>
    <p>This code will expire in 10 minutes.</p>
  </body>
</html>
```

---

## 🧪 Testing With MailDev

### 🔹 Start MailDev (Local SMTP Server)

```bash
npx maildev
```

- Web UI: [http://localhost:1080](http://localhost:1080)
- SMTP Host: `localhost`
- Port: `1025`

---

## 🐇 Monitoring RabbitMQ

Run RabbitMQ via Docker:

```bash
docker run -d \
  --hostname rabbit \
  --name rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  rabbitmq:3-management
```

- UI: [http://localhost:15672](http://localhost:15672)
- Login: `guest` / `guest`

---

## ✅ Final Test

Trigger:

```ts
await this.emailService.sendOtp('test@example.com', '123456');
```

Then:

- View mail in [http://localhost:1080](http://localhost:1080)
- View queue in [http://localhost:15672](http://localhost:15672)

---

## 🧼 Cleanup

```bash
docker stop rabbitmq
docker rm rabbitmq
```

---

## 🚀 Done!

You now have a production-ready email queuing system with full flexibility to add SMS, notifications, or analytics.