import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { REQUEST_USER_KEY } from '../constants';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!requiredRoles?.length) return true;

        const request = context.switchToHttp().getRequest();
        const user: ActiveUserData = request[REQUEST_USER_KEY];

        const hasRole = user?.roles?.some(role => requiredRoles.includes(role));

        if (!hasRole) {
            throw new ForbiddenException('You do not have required roles');
        }

        return true;
    }
}
