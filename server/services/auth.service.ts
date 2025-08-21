import * as jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserModel } from '../models/User';
import { User } from '@shared/schema';

export class AuthService {
  static generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roles: user.roles,
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '7d' }
    );
  }

  static verifyToken(token: string): any {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
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
