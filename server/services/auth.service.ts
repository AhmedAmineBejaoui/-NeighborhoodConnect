
import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';

/**
 * Generate a signed JWT for the provided user payload.
 */
export function generateToken(user: User) {
  return jwt.sign(
    { userId: user.id, email: user.email, roles: user.roles },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}


/**
 * Verify and decode a JWT.
 */
export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
}
