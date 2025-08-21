import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { UserModel } from '../models/User';
import { User } from '@shared/schema';

export interface AuthRequest extends Request {
  user?: User;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') ||
                  req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = AuthService.verifyToken(token);
    const user = await UserModel.findById(decoded.userId).lean();

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = { ...user, id: user._id.toString() } as User;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') ||
                  req.cookies?.token;

    if (!token) {
      return next();
    }

    const decoded = AuthService.verifyToken(token);
    const user = await UserModel.findById(decoded.userId).lean();

    if (user) {
      req.user = { ...user, id: user._id.toString() } as User;
    }

    next();
  } catch (error) {
    // Invalid token, but continue without user
    next();
  }
};
