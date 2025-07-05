import { Inject, Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { commonConfig } from 'src/common/config/common.config';

type TokenType = 'access' | 'refresh' | 'reset-password';

@Injectable()
export class JwtTokenService {
    constructor(
        private readonly jwtService: NestJwtService,
        @Inject(commonConfig.KEY)
        private readonly commonConfiguration: ConfigType<typeof commonConfig>,
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
                secret = this.commonConfiguration.jwt.refreshSecret;
                expiresIn = expiresInOverride || this.commonConfiguration.jwt.refreshExpiresIn;
                break;
            case 'reset-password':
                secret = this.commonConfiguration.jwt.resetPasswordSecret; // Add this to commonConfiguration
                expiresIn = expiresInOverride || '10m';
                break;
            default:
                secret = this.commonConfiguration.jwt.accessSecret;
                expiresIn = expiresInOverride || this.commonConfiguration.jwt.accessExpiresIn;
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
                secret = this.commonConfiguration.jwt.refreshSecret;
                break;
            case 'reset-password':
                secret = this.commonConfiguration.jwt.resetPasswordSecret;
                break;
            default:
                secret = this.commonConfiguration.jwt.accessSecret;
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
