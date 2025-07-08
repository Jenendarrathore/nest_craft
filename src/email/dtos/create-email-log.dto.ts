// src/email/dto/create-email-log.dto.ts

import { IsString, IsOptional, IsInt, IsObject, IsDateString } from 'class-validator';

export class CreateEmailLogDto {
    @IsString()
    to: string;

    @IsString()
    subject: string;

    @IsString()
    type: string;

    @IsString()
    status: string;

    @IsInt()
    @IsOptional()
    attempts?: number;

    @IsOptional()
    @IsObject()
    context?: Record<string, any>;

    @IsOptional()
    @IsString()
    error?: string;

    @IsOptional()
    @IsString()
    correlationId?: string;

    @IsOptional()
    @IsDateString()
    sentAt?: Date | null;

    @IsOptional()
    @IsString()
    providerResponseId?: string;

    @IsOptional()
    @IsString()
    retryReason?: string;
}
