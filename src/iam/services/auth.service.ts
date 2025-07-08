import { Injectable, BadRequestException, NotFoundException, Inject, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { RoleService } from './role.service';
import { UserService } from './user.service';
import { SignUpDto } from '../dtos/sign-up.dto';
import { ConfigType } from '@nestjs/config';
import { HashingService } from './hashing.service';
import { SignInDto } from '../dtos/sign-in.dto';
import { JwtTokenService } from './jwt-token.service';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { randomInt } from 'crypto';
import { VerifyResetCodeDto } from '../dtos/verify-reset-code.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { EmailSendPayload, EmailService } from 'src/email/services/email.service';
import { commonConfig } from 'src/common/config/common.config';
import { EmailType } from 'src/email/constants/email-type.enum';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly rolesService: RoleService,
        private readonly hashingService: HashingService,
        private readonly jwtTokenService: JwtTokenService,
        private readonly emailService: EmailService,

        @Inject(commonConfig.KEY)
        private readonly commonConfiguration: ConfigType<typeof commonConfig>,

    ) { }

    async signup(dto: SignUpDto) {
        const emailExists = await this.userService.isEmailTaken(dto.email);
        if (emailExists) {
            throw new BadRequestException('Email already taken');
        }

        const usernameExists = await this.userService.isUsernameTaken(dto.username);
        if (usernameExists) {
            throw new BadRequestException('Username already taken');
        }

        const hashedPassword = await this.hashingService.hash(dto.password);
        const defaultRoleName = this.commonConfiguration.defaultRole;
        const defaultRole = await this.rolesService.findByName(defaultRoleName);
        if (!defaultRole) {
            throw new NotFoundException(`Default role "${defaultRoleName}" not found. Seed it before using signup.`);
        }
        const user = await this.userService.create({
            ...dto,
            password: hashedPassword,
            roles: [defaultRole],
        });

        return {
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                roles: user.roles.map(r => r.name),
            }
        };
    }

    async signin(dto: SignInDto) {
        const user = await this.userService.findByEmailOrUsername(dto.emailOrUsername);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await this.hashingService.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            roles: user.roles.map(role => role.name),
        };

        const { accessToken, refreshToken } = await this.jwtTokenService.generateTokens(payload);


        // 2. Hash the refresh token
        const hashedRefreshToken = await this.hashingService.hash(refreshToken);

        // 3. Store it in DB
        await this.userService.update(user.id, {
            hashedRefreshToken,
            refreshTokenIssuedAt: new Date(),
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                roles: user.roles.map(role => role.name),
            },
        };
    }

    async refreshToken(dto: RefreshTokenDto) {
        const { refreshToken } = dto;
        let payload: Record<string, any>;

        try {
            payload = await this.jwtTokenService.verify(refreshToken, 'refresh'); // verify validity
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const user = await this.userService.findOneById(payload.sub);

        if (!user || !user.hashedRefreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        const isMatch = await this.hashingService.compare(refreshToken, user.hashedRefreshToken);
        if (!isMatch) {
            throw new UnauthorizedException('Refresh token mismatch');
        }

        // ✅ Token valid, issue new ones and rotate
        const newPayload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            roles: user.roles.map(r => r.name),
        };

        const { accessToken, refreshToken: newRefreshToken } = await this.jwtTokenService.generateTokens(newPayload);
        const hashedNewRefreshToken = await this.hashingService.hash(newRefreshToken);
        await this.userService.update(user.id, {
            hashedRefreshToken: hashedNewRefreshToken,
            refreshTokenIssuedAt: new Date(),
        });

        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }


    async forgotPassword(dto: ForgotPasswordDto) {
        const { email } = dto;
        const user = await this.userService.findByEmailOrUsername(email);

        if (!user) {
            // To avoid user enumeration, you can log and return generic response
            console.warn(`Password reset requested for non-existent email: ${email}`);
            return { message: 'If the email exists, a reset code has been sent.' };
        }

        const otpCode = randomInt(100000, 999999).toString(); // 6-digit code
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

        await this.userService.update(user.id, {
            otpCode: otpCode,
            otpExpiresAt: otpExpiresAt,
        });


        const emailPayload: EmailSendPayload = {
            to: email,
            type: EmailType.OTP,
            subject: "Reset Password Otp",
            context: { otp: otpCode } // variables to render in template
        }


        await this.emailService.sendEmail({
            to: email,
            subject: "Reset Password Otp",
            type: 'otp', // this maps to `otp.hbs` template
            context: { otp: otpCode },
        });

        console.log(`🔐 OTP for ${email}: ${otpCode}`); // 🔧 Replace with actual email later

        return { message: 'OTP has been sent to your email.' };
    }


    async verifyResetCode(dto: VerifyResetCodeDto) {
        const user = await this.userService.findByEmailOrUsername(dto.email);

        if (!user || !user.otpCode || !user.otpExpiresAt) {
            throw new UnauthorizedException('Invalid or expired code');
        }

        const isCodeValid = user.otpCode === dto.code;
        const isCodeNotExpired = user.otpExpiresAt > new Date();

        if (!isCodeValid || !isCodeNotExpired) {
            throw new UnauthorizedException('Invalid or expired code');
        }


        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username,
            roles: user.roles.map(role => role.name),
        };
        // Issue short-lived password reset token (e.g. 10 minutes)
        const token = await this.jwtTokenService.sign(payload, 'reset-password', '10m');

        // Optional: clear code after verification to prevent reuse
        await this.userService.update(user.id, {
            otpCode: null,
            otpExpiresAt: null,
        });

        return {
            message: 'Code verified. Use the token to reset your password.',
            token,
        };
    }

    async resetPassword(dto: ResetPasswordDto) {
        const { token, newPassword } = dto;

        console.log(token);

        let payload: any;
        try {
            payload = await this.jwtTokenService.verify(token, 'reset-password');
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired reset token');
        }

        const user = await this.userService.findOneById(payload.sub);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const hashedPassword = await this.hashingService.hash(newPassword);

        await this.userService.update(user.id, {
            password: hashedPassword,
        });

        return {
            message: 'Password has been reset successfully.',
        };
    }


    async logout(userId: number): Promise<void> {
        await this.userService.update(userId, {
            hashedRefreshToken: null,
            refreshTokenIssuedAt: null, // optional
        });
    }


}
