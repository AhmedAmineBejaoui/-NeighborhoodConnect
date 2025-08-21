
import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET || JWT_SECRET.trim().length === 0) {
  throw new Error('JWT_SECRET est manquant. Ajoute-le dans ton fichier .env');
}

/**
 * Generate a signed JWT for the provided user payload.
 */
export function generateToken(user: User) {
  return jwt.sign(
    { userId: user.id, email: user.email, roles: user.roles },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}


/**
 * Verify and decode a JWT.
 */
export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
}
