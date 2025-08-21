import * as jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserModel, UserDocument } from '../models/User';
import { User } from '@shared/schema';

export class AuthService {
  private static refreshTokenBlacklist = new Set<string>();

  static generateAccessToken(user: User): string {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        roles: user.roles 
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
  }

  static generateRefreshToken(user: User): string {
    return jwt.sign(
      { userId: user.id },
      env.JWT_REFRESH_SECRET,
      { expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d` }
    );
  }

  static verifyAccessToken(token: string): any {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  }

  static verifyRefreshToken(token: string): any {
    if (this.refreshTokenBlacklist.has(token)) {
      throw new Error('Token is blacklisted');
    }
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  }

  static blacklistRefreshToken(token: string): void {
    this.refreshTokenBlacklist.add(token);
    
    // Clean up expired tokens periodically
    setTimeout(() => {
      this.refreshTokenBlacklist.delete(token);
    }, env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  }

  static async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await UserModel.findOne({ email }).lean();
    if (!user) return null;

    const userDoc = await UserModel.findById(user._id);
    if (!userDoc || !(await userDoc.comparePassword(password))) {
      return null;
    }

    return userDoc.toJSON() as User;
  }
}
