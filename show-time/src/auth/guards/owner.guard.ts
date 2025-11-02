import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; //récupère l'utilisateur qui effectue la request
    const targetId = request.params.id;

    // Les admins peuvent tout faire
    if (user.role === Role.ADMIN) {
      return true;
    }

    // Un utilisateur peut accéder à ses propres données
    if (user.id === targetId) {
      return true;
    }

    throw new ForbiddenException('You cannot access this resource');
  }
}
