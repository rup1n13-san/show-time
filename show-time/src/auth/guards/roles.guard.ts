import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Récupère les rôles requis définis dans le décorateur @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si aucun rôle n'est requis, on autorise
    if (!requiredRoles) {
      return true;
    }

    // Récupère l'utilisateur depuis la requête (ajouté par JwtStrategy)
    const { user } = context.switchToHttp().getRequest();

    // Vérifie si l'utilisateur a un des rôles requis
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('You do not have the necessary permissions');
    }

    return true;
  }
}
