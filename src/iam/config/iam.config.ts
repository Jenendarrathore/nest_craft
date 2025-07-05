import { registerAs } from '@nestjs/config';

export const iamConfig = registerAs('iam', () => ({
  defaultRole: process.env.IAM_DEFAULT_ROLE || 'admin',
  jwt: {
    accessSecret: process.env.ACCESS_JWT_SECRET || 'super-secret-key',
    accessExpiresIn: process.env.ACCESS_JWT_EXPIRY || '20m',
    refreshSecret: process.env.REFRESH_JWT_EXPIRY || 'super-refresh-secret-key',
    refreshExpiresIn: process.env.REFRESH_JWT_EXPIRY || '7d',
    resetPasswordSecret:process.env.RESET_PASSWORD_SECRET || 'super-reset-password-secret-key',
    resetPasswordExpiresIn:process.env.RESET_PASSWORD_JWT_EXPIRY || '10M',
  }

}));
