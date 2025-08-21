import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { Request } from 'express';
import { AuthRequest } from './auth';

const isProd = process.env.NODE_ENV === 'production';

// General rate limit for all requests
export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, // trust proxy to obtain real client IP
  // Do not rate-limit aggressively in development
  skip: () => !isProd,
});

// Stricter rate limit for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes per IP
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Disable auth rate limiting in development to ease testing
  skip: () => !isProd,
});

// Rate limit for authenticated users (higher limit)
export const authenticatedRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500, // 500 requests per minute for authenticated users
  keyGenerator: (req: Request) => {
    const authReq = req as AuthRequest;
    return authReq.user?.id || ipKeyGenerator(req);
  },
  message: {
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Disable in development
  skip: () => !isProd,
});

// Rate limit for posting content
export const postRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 posts per 5 minutes
  keyGenerator: (req: Request) => {
    const authReq = req as AuthRequest;
    return authReq.user?.id || ipKeyGenerator(req);
  },
  message: {
    error: 'Too many posts created, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Disable in development
  skip: () => !isProd,
});
