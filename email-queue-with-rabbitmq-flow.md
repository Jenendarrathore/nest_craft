# 📧 Email Queue System with RabbitMQ (NestJS)

This module implements a modular, extendable email system in NestJS using:

- ✅ RabbitMQ for async queue-based email dispatch
- ✅ Handlebars for email templates
- ✅ Nodemailer for SMTP
- ✅ Fallback to direct email if queuing is disabled
- ✅ MailDev for local email testing with UI

---

## 🏗️ Architecture Overview

```
Client / Controller (e.g. forgot-password)
        |
        v
EmailService.sendOtp()
        |
  ┌─────┴─────┐
  | useQueue? |────────────┐
  └─────┬─────┘            |
        | No               | Yes
        v                  v
directMailer.sendOtp   RabbitMQ.publish("send_otp_email")
                          |
                   RabbitMQ Consumer (EmailController)
                          |
               directMailer.sendOtpEmail(...)
                          |
                 SMTP (via MailDev or real SMTP)
```

---

## ⚙️ Configuration (.env)

```env
# Toggle between direct + queue-based
USE_RABBITMQ_EMAIL=true

# RabbitMQ Connection
RABBITMQ_URL=amqp://localhost:5672
EMAIL_QUEUE_NAME=email_queue

# SMTP (for MailDev or Gmail etc.)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM_EMAIL=noreply@example.com
```

---

## 📂 Folder Structure

```
src/
├── email/
│   ├── email.module.ts
│   ├── email.service.ts       // Chooses between queue or direct
│   ├── direct-mailer.service.ts // Sends email via Nodemailer
│   ├── controllers/
│   │   └── email.controller.ts // RabbitMQ consumer
│   └── services/
│       └── templates/
│           └── otp.hbs         // Handlebars template
```

---

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
npm install amqplib amqp-connection-manager nodemailer handlebars
```

---

### 2. Start RabbitMQ (Docker)

```bash
docker run -d \
  --hostname rabbit \
  --name rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  rabbitmq:3-management
```

- Web UI: [http://localhost:15672](http://localhost:15672)
- Username: `guest`, Password: `guest`

---

### 3. Start MailDev for SMTP Testing (Optional)

```bash
npx maildev
```

- Web UI: [http://localhost:1080](http://localhost:1080)
- SMTP: `localhost:1025`

---

### 4. Run NestJS App

```bash
npm run start:dev
```

If successful:
- RabbitMQ should show active connection
- Messages will be sent to `email_queue` and picked up
- Emails will show in [MailDev UI](http://localhost:1080)

---

## ✅ How to Test

### 🔹 1. Trigger OTP Email

Call your controller/service:

```ts
await this.emailService.sendOtp('user@example.com', '123456');
```

### 🔹 2. Behavior:

- If `USE_RABBITMQ_EMAIL=true`:
  - Message is published to RabbitMQ
  - `EmailController` consumes it
  - `DirectMailerService` sends the email

- If `USE_RABBITMQ_EMAIL=false`:
  - `DirectMailerService` sends it immediately

### 🔹 3. See Result

- Open [http://localhost:1080](http://localhost:1080) to view the email
- Open [http://localhost:15672](http://localhost:15672) to monitor the queue

---

## 🧪 Optional Enhancements

- Add retries or dead-letter queues (DLQ)
- Add other queues (SMS, push notifications)
- Extend template system with partials/layouts
- Use `class-validator` for email DTOs

---

## 🧼 Cleanup

```bash
# Stop RabbitMQ
docker stop rabbitmq
docker rm rabbitmq

# Stop MailDev
CTRL+C in terminal
```

---

## 🙌 Credits

Built using:
- [NestJS](https://docs.nestjs.com/)
- [RabbitMQ](https://www.rabbitmq.com/)
- [MailDev](https://github.com/maildev/maildev)
- [Nodemailer](https://nodemailer.com/about/)
- [Handlebars](https://handlebarsjs.com/)