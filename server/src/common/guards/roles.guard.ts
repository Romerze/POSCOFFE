import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { JwtPayload, Permission, Role } from '@poscoffe/types';
import { PERMISSIONS_KEY, ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length && !requiredPermissions?.length) return true;

    const { user } = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    if (!user) throw new ForbiddenException('No autenticado');

    if (requiredRoles?.length && !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Rol no autorizado');
    }
    if (requiredPermissions?.length) {
      const has = requiredPermissions.every((p) => user.permissions.includes(p));
      if (!has) throw new ForbiddenException('Permiso insuficiente');
    }
    return true;
  }
}
