import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { createServer } from 'http';
import { Server } from 'socket.io';
import env from './config/env';
import { connectDB } from './db/connection';
import { registerRoutes } from './routes';

const logger = pino();
const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS.split(','), credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 100 }));
app.use(pinoHttp({ logger }));

registerRoutes(app);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: env.CORS_ORIGINS.split(','), credentials: true }
});

io.on('connection', socket => {
  socket.on('join', room => socket.join(room));
});

async function start() {
  await connectDB();
  httpServer.listen(env.PORT, () => {
    logger.info(`API listening on ${env.PORT}`);
  });
}

start();
