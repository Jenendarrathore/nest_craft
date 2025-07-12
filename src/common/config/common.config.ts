import { registerAs } from '@nestjs/config';

export const commonConfig = registerAs('common', () => ({
  defaultRole: process.env.IAM_DEFAULT_ROLE || 'admin',
  jwt: {
    accessSecret: process.env.ACCESS_JWT_SECRET || 'super-secret-key',
    accessExpiresIn: process.env.ACCESS_JWT_EXPIRY || '20m',
    refreshSecret: process.env.REFRESH_JWT_EXPIRY || 'super-refresh-secret-key',
    refreshExpiresIn: process.env.REFRESH_JWT_EXPIRY || '7d',
    resetPasswordSecret: process.env.RESET_PASSWORD_SECRET || 'super-reset-password-secret-key',
    resetPasswordExpiresIn: process.env.RESET_PASSWORD_JWT_EXPIRY || '10M',
  },
  rabbitmq: {
    useRabbitmqEmail: process.env.USE_RABBITMQ_EMAIL || "",
    rabbitmqUrl: process.env.RABBITMQ_URL || "",
    emailQueueName: process.env.EMAIL_QUEUE_NAME || "",
    emailQueueDlqName: process.env.EMAIL_QUEUE_DLQ_NAME || ""
    
  }

}));
