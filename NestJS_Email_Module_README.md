# 📧 NestJS Email Module with RabbitMQ + SMTP + Logging

This module provides a robust email delivery system with the following features:

- ✅ SMTP-based email sending
- ✅ Optional RabbitMQ queue for non-blocking delivery
- ✅ Graceful fallback if RabbitMQ is disabled
- ✅ Handlebars templating for dynamic HTML emails
- ✅ Email logging to PostgreSQL
- ✅ DLQ (Dead Letter Queue) handling for failed messages

---

## 🔧 Environment Configuration

### `.env`
```env
# General
USE_RABBITMQ_EMAIL=true

# SMTP
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM_EMAIL=no-reply@nestcraft.com

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
EMAIL_QUEUE_NAME=email_queue_nest_craft
EMAIL_QUEUE_DLQ_NAME=email_queue_nest_craft_dlq
```

---

## 📦 Folder Structure

```
src/
├── email/
│   ├── constants/
│   │   └── email-templates.config.ts
│   ├── dto/
│   │   ├── create-email-log.dto.ts
│   │   └── update-email-log.dto.ts
│   ├── entities/
│   │   └── email-log.entity.ts
│   ├── interfaces/
│   │   └── email-send-payload.interface.ts
│   ├── listeners/
│   │   └── email.listener.ts
│   ├── services/
│   │   ├── direct-mail.service.ts
│   │   ├── email-log.service.ts
│   │   └── email.service.ts
│   ├── queues/
│   │   └── email.producer.ts
│   ├── templates/
│   │   ├── otp.hbs
│   │   ├── welcome.hbs
│   │   └── ...
│   └── email.module.ts
```

---

## 🚀 How It Works

### 1. `EmailService.sendMail()`
- Checks `USE_RABBITMQ_EMAIL` from config
- If `true`, sends the job to RabbitMQ (`email_queue_nest_craft`)
- If `false`, directly sends email using `nodemailer`

### 2. `EmailQueueListener`
- Listens to `email_queue_nest_craft`
- Invokes `DirectMailService.send()` to send via SMTP
- If email fails, pushes to DLQ: `email_queue_nest_craft_dlq`

### 3. `DLQ Handler`
- `@EventPattern(DLQ_QUEUE)`
- Logs to DB with status `FAILED` and `retryReason`

---

## 🧪 Testing with MailDev

1. Install MailDev globally:

```bash
npm install -g maildev
```

2. Start MailDev:

```bash
maildev
```

3. Access Mail UI:

```
http://localhost:1080
```

---

## 🐳 Running RabbitMQ (Docker)

```bash
docker run -d \
  --hostname rabbitmq \
  --name rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  rabbitmq:3-management
```

- RabbitMQ UI: http://localhost:15672  
- Default creds: `guest` / `guest`

---

## 🧱 Email Templates

Templates live in `src/email/templates/`. Use Handlebars syntax:

### Example: `otp.hbs`
```html
<h3>Your OTP Code</h3>
<p>Hello, your OTP is <strong>{{otp}}</strong>.</p>
```

---

## 📝 Example Payload

```ts
await emailService.sendMail({
  to: 'user@example.com',
  subject: 'Your OTP Code',
  type: 'otp', // resolves to otp.hbs
  context: { otp: '123456' },
});
```

---

## 🛡 Logging Table: `email_logs`

| Field               | Type         | Description                       |
|--------------------|--------------|-----------------------------------|
| `id`               | UUID         | Primary key                       |
| `to`               | string       | Recipient email                   |
| `subject`          | string       | Email subject                     |
| `type`             | string       | Template type (`otp`, `welcome`)  |
| `status`           | string       | PENDING / SUCCESS / FAILED        |
| `attempts`         | number       | Retry attempts count              |
| `context`          | JSONB        | Data injected into the template   |
| `error`            | text         | Error message if failed           |
| `sentAt`           | timestamp    | When mail was successfully sent   |
| `providerResponseId` | string     | SMTP response ID                  |
| `retryReason`      | text         | Reason for DLQ fallback           |
| `correlationId`    | string       | Optional trace ID                 |
| `createdAt`        | timestamp    | Auto-created                      |
| `updatedAt`        | timestamp    | Auto-updated                      |

---

## ✅ Production Ready Features

- [x] Async and non-blocking
- [x] Queue fallback optional
- [x] Logging + retries
- [x] DLQ with separate listener
- [x] Config-driven architecture
- [x] TypeORM auto-sync ready

---

## 🛠️ Commands

```bash
# start dev with watch
npm run start:dev

# format code
npm run format

# test mail directly (e.g. reset password)
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## 📦 Future Enhancements

- Retry mechanism from DB
- Admin dashboard to view email logs
- Webhooks for bounce/failure tracking

---

> Built with ❤️ for modular, fault-tolerant email delivery in NestJS.
