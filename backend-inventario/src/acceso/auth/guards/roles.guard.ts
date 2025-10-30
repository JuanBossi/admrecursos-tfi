import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, RoleName } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest() as any;
    const user = req.user as { roles?: { nombre: string }[] } | undefined;
    const names = (user?.roles || []).map((r) => r.nombre);
    const ok = required.some((r) => names.includes(r));
    if (!ok) throw new ForbiddenException('No tiene permisos para esta acción');
    return true;
  }
}

