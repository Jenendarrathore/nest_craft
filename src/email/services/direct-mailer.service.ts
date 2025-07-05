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
            host: this.configService.get<string>('SMTP_HOST'),
            port: Number(this.configService.get<string>('SMTP_PORT')),
            secure: false, // set to true if using port 465
            auth: {
                user: this.configService.get<string>('SMTP_USER'), // optional
                pass: this.configService.get<string>('SMTP_PASS'), // optional
            },
        });
    }

    async sendOtpEmail(to: string, otp: string): Promise<void> {
        const templatePath = join(__dirname, 'templates', 'email-otp.hbs');
        // const htmlTemplate = readFileSync(templatePath, 'utf-8');
        // const compiledHtml = hbs.compile(htmlTemplate)({ otp });

        await this.transporter.sendMail({
            from: this.configService.get<string>('SMTP_FROM_EMAIL'),
            to,
            subject: 'Your OTP Code',
            html: otp,
        });
    }
}
