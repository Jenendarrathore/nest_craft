// src/common/guards/authentication.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    private jwtGuard = new (AuthGuard('jwt'))();

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        let error = new UnauthorizedException();

        const canActivate = await Promise.resolve(this.jwtGuard.canActivate(context)
        ).catch((err) => {
            error = err;
        });

        if (canActivate) {
            return true;
        }

        throw error;
    }
}
