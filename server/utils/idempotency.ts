import { Request, Response, NextFunction } from 'express';

const idempotencyStore = new Map<string, any>();

export const idempotencyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idempotencyKey = req.headers['idempotency-key'] as string;
  
  if (!idempotencyKey) {
    return next();
  }

  // Check if we already processed this request
  const stored = idempotencyStore.get(idempotencyKey);
  if (stored) {
    return res.status(stored.status).json(stored.data);
  }

  // Override res.json to store the response
  const originalJson = res.json;
  res.json = function(data: any) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Store successful responses for 1 hour
      idempotencyStore.set(idempotencyKey, {
        status: res.statusCode,
        data,
      });

      // Clean up after 1 hour
      setTimeout(() => {
        idempotencyStore.delete(idempotencyKey);
      }, 60 * 60 * 1000);
    }

    return originalJson.call(this, data);
  };

  next();
};
