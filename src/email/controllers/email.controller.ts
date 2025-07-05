import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { DirectMailerService } from '../services/direct-mailer.service';

@Controller()
export class EmailController {
    constructor(private readonly directMailer: DirectMailerService) { }

    @EventPattern('send_otp_email')
    async handleOtpEmail(@Payload() data: { to: string; otp: string }) {
        await this.directMailer.sendOtpEmail(data.to, data.otp);
    }
}
