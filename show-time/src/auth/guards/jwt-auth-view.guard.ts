import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Injectable()
export class JwtAuthViewGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const response = context.switchToHttp().getResponse<Response>();

    if (err || !user) {
      // Rediriger vers la page de connexion au lieu de renvoyer 401
      response.redirect('/auth/login');
      return;
    }

    return user;
  }
}
