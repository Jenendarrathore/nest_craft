import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';
import { UserStatus } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    status?: UserStatus;

    @IsOptional()
    profileImageUrl?: string;

    @IsOptional()
    isEmailVerified?: boolean;

    @IsOptional()
    isFirstLogin?: boolean;

    @IsOptional()
    @IsString()
    otpCode?: string | null;

    @IsOptional()
    otpExpiresAt?: Date | null;

    @IsOptional()
    hashedRefreshToken?: string | null

    @IsOptional()
    refreshTokenIssuedAt?: Date | null;

}
