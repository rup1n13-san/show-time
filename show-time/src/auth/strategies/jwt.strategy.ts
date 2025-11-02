import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

// Fonction pour extraire le JWT depuis les cookies
const jwtCookieExtractor = (req: Request): string | null => {
  let token = null;

  if (req && req.cookies) {
    // Remplacez 'access_token' par le nom de votre cookie si différent
    token = req.cookies['access_token'];
  }

  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /*Une stratégie est un ensemble de règles et de processus qui déterminent comment vérifier l'identité d'un utilisateur et gérer sa session*/
  constructor(private prisma: PrismaService) {
    super({
      // Extraire le JWT depuis le cookie OU le header Authorization (pour Postman)
      jwtFromRequest: ExtractJwt.fromExtractors([
        jwtCookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret_secure_key',
    });
  }

  async validate(payload: any) {
    // payload contient : { sub: userId, email, role }
    const user = await this.prisma.prismaClient.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Ces données seront disponibles dans request.user
    return user;
  }
}
