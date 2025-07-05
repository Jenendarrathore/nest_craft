import { Inject, Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { iamConfig } from '../config/iam.config';

type TokenType = 'access' | 'refresh' | 'reset-password';

@Injectable()
export class JwtTokenService {
    constructor(
        private readonly jwtService: NestJwtService,
        @Inject(iamConfig.KEY)
        private readonly config: ConfigType<typeof iamConfig>,
    ) { }


    async sign(
        payload: Record<string, any>,
        type: TokenType = 'access',
        expiresInOverride?: string, // optional override
    ): Promise<string> {
        let secret: string;
        let expiresIn: string;

        switch (type) {
            case 'refresh':
                secret = this.config.jwt.refreshSecret;
                expiresIn = expiresInOverride || this.config.jwt.refreshExpiresIn;
                break;
            case 'reset-password':
                secret = this.config.jwt.resetPasswordSecret; // Add this to config
                expiresIn = expiresInOverride || '10m';
                break;
            default:
                secret = this.config.jwt.accessSecret;
                expiresIn = expiresInOverride || this.config.jwt.accessExpiresIn;
        }

        return this.jwtService.signAsync(payload, {
            secret,
            expiresIn,
        });
    }

    async verify<T extends object = any>(
        token: string,
        type: TokenType = 'access',
    ): Promise<T> {
        let secret: string;

        switch (type) {
            case 'refresh':
                secret = this.config.jwt.refreshSecret;
                break;
            case 'reset-password':
                secret = this.config.jwt.resetPasswordSecret;
                break;
            default:
                secret = this.config.jwt.accessSecret;
        }

        return this.jwtService.verifyAsync<T>(token, { secret });
    }

    async generateTokens(payload: Record<string, any>) {
        const [accessToken, refreshToken] = await Promise.all([
            this.sign(payload, 'access'),
            this.sign(payload, 'refresh'),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }


    decode<T extends object = any>(token: string): T | null {
        return this.jwtService.decode(token) as T | null;
    }
}
