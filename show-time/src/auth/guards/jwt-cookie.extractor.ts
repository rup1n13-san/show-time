import { Request } from 'express';

export const jwtCookieExtractor = (req: Request): string | null => {
  let token = null;
  if (req && req.cookies) {
    // Remplacez 'access_token' par le nom de votre cookie
    token = req.cookies['access_token'];
  }
  return token;
};
