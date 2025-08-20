import { Router, type Express } from 'express';

export function registerRoutes(app: Express) {
  const router = Router();
  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  app.use('/api', router);
}
