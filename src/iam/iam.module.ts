// src/iam/iam.module.ts
import { Module } from '@nestjs/common';
import { AuthenticationGuard } from './guards/authentication.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { RoleController } from './controllers/role.controller';
import { RoleService } from './services/role.service';
import { Role } from './entities/role.entity';
import { HashingService } from './services/hashing.service';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtTokenService } from './services/jwt-token.service';
import { RolesGuard } from './guards/roles.guard';
import { EmailModule } from 'src/email/email.module';
import { commonConfig } from 'src/common/config/common.config';

@Module({
    imports: [
        ConfigModule,
        ConfigModule.forFeature(commonConfig),
        JwtModule.registerAsync({
            imports: [ConfigModule, ConfigModule.forFeature(commonConfig)],
            inject: [commonConfig.KEY],
            useFactory: (config: ConfigType<typeof commonConfig>) => ({
                secret: config.jwt.accessSecret,
                signOptions: {
                    expiresIn: config.jwt.accessExpiresIn,
                },
            }),
        }),

        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([Role]),
        EmailModule
    ],
    controllers: [UserController, RoleController, AuthController],
    providers: [AuthenticationGuard, RolesGuard,JwtStrategy, UserService, RoleService, AuthService, HashingService, JwtTokenService],
    exports: [AuthenticationGuard, RolesGuard,JwtStrategy], // ✅ Export for global use
})
export class IamModule { }
