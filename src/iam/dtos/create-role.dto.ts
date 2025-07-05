import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
    @ApiProperty({ example: 'admin', description: 'Name of the role' })
    @IsString()
    @MinLength(3)
    name: string;

    @ApiProperty({ example: 'Admin Role', description: 'Description of the role' })
    @IsOptional()
    @IsString()
    description?: string;

}
