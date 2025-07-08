// src/email/services/direct-mail.service.ts

import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as handlebars from 'handlebars';
import { EmailLogService } from './email-log.service';

interface DirectMailOptions {
  to: string;
  subject: string;
  type: string;
  context: Record<string, any>;
  correlationId?: string;
}

@Injectable()
export class DirectMailService {
  private readonly logger = new Logger(DirectMailService.name);

  private readonly transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
  });

  constructor(private readonly emailLogService: EmailLogService) {}

  async send(options: DirectMailOptions) {
    const { to, subject, type, context, correlationId } = options;

    const log = await this.emailLogService.create({
      to,
      subject,
      type,
      status: 'PENDING',
      context,
      correlationId,
      attempts: 1,
    });

    try {
      // const templatePath = path.join(__dirname, '..', 'templates', `${type}.hbs`);
      const templateName  = `${type}.hbs`
      const templatePath = path.join(process.cwd(), 'src/email/templates', templateName);
      const source = await fs.readFile(templatePath, 'utf-8');
      const html = handlebars.compile(source)(context);

      const result = await this.transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL,
        to,
        subject,
        html:html,
      });

      await this.emailLogService.update(log.id, {
        status: 'SUCCESS',
        sentAt: new Date(),
        providerResponseId: result.messageId,
      });
    } catch (error) {
      await this.emailLogService.update(log.id, {
        status: 'FAILED',
        error: error.message,
      });
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
