import type { Express } from "express";
import { createServer, type Server } from "http";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';

// Configuration
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase } from './config/database';

// Models
import { UserModel } from './models/User';
import { CommunityModel } from './models/Community';
import { PostModel } from './models/Post';
import { CommentModel } from './models/Comment';
import { VoteModel } from './models/Vote';
import { ReportModel } from './models/Report';
import { NotificationModel } from './models/Notification';

// Services
import { AuthService } from './services/auth.service';
import { RBACService } from './services/rbac';
import { SpamService } from './services/spam';
import { NotificationService } from './services/notifications';
import { UploadService } from './services/uploads';

// Middleware
import { authMiddleware, optionalAuth, AuthRequest } from './middlewares/auth';
import { rbacGuard, permissionGuard } from './middlewares/rbacGuard';
import { errorHandler, notFoundHandler } from './middlewares/error';
import { generalRateLimit, authRateLimit, authenticatedRateLimit, postRateLimit } from './middlewares/rateLimit';
import { idempotencyMiddleware } from './utils/idempotency';

// Utils
import { getPaginationParams, buildCursorQuery, buildPaginatedResponse } from './utils/pagination';

// WebSocket
import { WebSocketService } from './ws';

// Schemas
import { 
  insertUserSchema, 
  insertPostSchema, 
  insertCommentSchema, 
  insertVoteSchema, 
  insertReportSchema,
  User
} from '@shared/schema';

export async function registerRoutes(app: Express): Promise<Server> {
  // Connect to database
  await connectDatabase();

  // Middleware setup
  // Configure helmet with relaxed CSP for development, strict for production
  const isDevelopment = process.env.NODE_ENV === 'development';
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: isDevelopment 
          ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "http://localhost:*", "ws://localhost:*"]
          : ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: isDevelopment 
          ? ["'self'", "ws://localhost:*", "http://localhost:*"]
          : ["'self'"],
      },
    },
  }));

  app.use(cors({
    origin: env.CORS_ORIGINS.split(','),
    credentials: true,
  }));

  app.use(cookieParser());
  app.use(generalRateLimit);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.post('/api/auth/register', authRateLimit, async (req, res, next) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
          // Check if user exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Create user
      const user = await storage.createUser({
        ...userData,
        password: userData.password,
      });

      const accessToken = AuthService.generateAccessToken(user);
      const refreshToken = AuthService.generateRefreshToken(user);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({ 
        user, 
        accessToken 
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/login', authRateLimit, async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await storage.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const accessToken = AuthService.generateAccessToken(user);
      const refreshToken = AuthService.generateRefreshToken(user);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
      });

      res.json({ user, accessToken });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/refresh', async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      const decoded = AuthService.verifyRefreshToken(refreshToken);
      const user = await storage.getUser(decoded.userId);

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      const userJson = { ...user, id: user._id.toString() } as User;
      const accessToken = AuthService.generateAccessToken(userJson);

      res.json({ accessToken, user: userJson });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      AuthService.blacklistRefreshToken(refreshToken);
    }

    res.clearCookie('refreshToken');
    res.status(204).send();
  });

  // Apply authentication middleware for protected routes
  app.use('/api', authenticatedRateLimit);

  // Communities routes
  app.get('/api/communities/:id', optionalAuth, async (req, res, next) => {
    try {
      const community = await CommunityModel.findById(req.params.id);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }

      res.json(community);
    } catch (error) {
      next(error);
    }
  });

  // Posts routes
  app.get('/api/communities/:id/posts', optionalAuth, async (req, res, next) => {
    try {
      const { cursor, limit } = getPaginationParams(req);
      const { type, q, tags } = req.query;

      const filter: any = { 
        communityId: req.params.id,
        status: 'published',
        ...buildCursorQuery('createdAt', cursor?.toISOString())
      };

      if (type) {
        filter.type = type;
      }

      if (q) {
        filter.$text = { $search: q as string };
      }

      if (tags) {
        const tagArray = (tags as string).split(',').map(tag => tag.trim());
        filter.tags = { $in: tagArray };
      }

      const posts = await PostModel.find(filter)
        .populate('authorId', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .lean();

      const response = buildPaginatedResponse(posts.map(p => ({ ...p, id: p._id })), limit);
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/posts', authMiddleware, rbacGuard('resident', 'moderator', 'admin'), postRateLimit, idempotencyMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const postData = insertPostSchema.parse(req.body);

      // Check spam
      const spamCheck = SpamService.checkContent(postData.title, postData.body);
      if (spamCheck.isSpam) {
        logger.warn('Spam content detected:', { userId: req.user!.id, spamCheck });
        postData.status = 'hidden';
      }

      // Record user activity for spam detection
      SpamService.recordActivity(req.user!.id);

      const post = new PostModel({
        ...postData,
        authorId: req.user!.id,
      });

      await post.save();
      await post.populate('authorId', 'name email');

      const postJson = post.toJSON();

      // Emit real-time event
      if (postJson.status === 'published') {
        WebSocketService.emitPostCreated(postJson);
      }

      // Create notification for moderators if spam detected
      if (spamCheck.isSpam) {
        await NotificationService.notifyReportOpened(
          postJson.id,
          'post',
          postJson.id
        );
      }

      res.status(201).json(postJson);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/posts/:id', optionalAuth, async (req, res, next) => {
    try {
      const post = await PostModel.findById(req.params.id)
        .populate('authorId', 'name email');

      if (!post || post.status === 'hidden') {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.json(post);
    } catch (error) {
      next(error);
    }
  });

  // Comments routes
  app.post('/api/posts/:id/comments', authMiddleware, rbacGuard('resident', 'moderator', 'admin'), async (req: AuthRequest, res, next) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);

      // Verify post exists
      const post = await PostModel.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const comment = new CommentModel({
        ...commentData,
        postId: req.params.id,
        authorId: req.user!.id,
      });

      await comment.save();
      await comment.populate('authorId', 'name email');

      const commentJson = comment.toJSON();

      // Emit real-time event
      WebSocketService.emitCommentCreated(commentJson, req.params.id, post.communityId.toString());

      res.status(201).json(commentJson);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/posts/:id/comments', async (req, res, next) => {
    try {
      const { cursor, limit } = getPaginationParams(req);

      const comments = await CommentModel.find({
        postId: req.params.id,
        status: 'published',
        ...buildCursorQuery('createdAt', cursor?.toISOString())
      })
        .populate('authorId', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .lean();

      const response = buildPaginatedResponse(comments.map(c => ({ ...c, id: c._id })), limit);
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  // Votes routes
  app.post('/api/posts/:id/votes', authMiddleware, rbacGuard('resident', 'moderator', 'admin'), idempotencyMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const voteData = insertVoteSchema.parse(req.body);

      // Verify post is a poll
      const post = await PostModel.findById(req.params.id);
      if (!post || post.type !== 'poll') {
        return res.status(400).json({ error: 'Post is not a poll' });
      }

      // Upsert vote (update if exists, create if not)
      await VoteModel.findOneAndUpdate(
        { postId: req.params.id, userId: req.user!.id },
        { optionIndex: voteData.optionIndex },
        { upsert: true, new: true }
      );

      // Calculate new tally
      const votes = await VoteModel.find({ postId: req.params.id });
      const tally = votes.reduce((acc, vote) => {
        acc[vote.optionIndex] = (acc[vote.optionIndex] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // Emit real-time event
      WebSocketService.emitPollTally(req.params.id, post.communityId.toString(), tally);

      res.json({ tally, totalVotes: votes.length });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/posts/:id/votes/tally', async (req, res, next) => {
    try {
      const votes = await VoteModel.find({ postId: req.params.id });
      const tally = votes.reduce((acc, vote) => {
        acc[vote.optionIndex] = (acc[vote.optionIndex] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      res.json({ tally, totalVotes: votes.length });
    } catch (error) {
      next(error);
    }
  });

  // Reports routes
  app.post('/api/reports', authMiddleware, rbacGuard('resident', 'moderator', 'admin'), idempotencyMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const reportData = insertReportSchema.parse(req.body);

      const report = new ReportModel({
        ...reportData,
        reporterId: req.user!.id,
      });

      await report.save();

      const reportJson = report.toJSON();

      // Emit to moderators
      WebSocketService.emitReportOpened(reportJson);

      res.status(201).json(reportJson);
    } catch (error) {
      next(error);
    }
  });

  // Moderation routes
  app.get('/api/moderation/reports', authMiddleware, rbacGuard('moderator', 'admin'), async (req, res, next) => {
    try {
      const { cursor, limit } = getPaginationParams(req);
      const { status = 'open' } = req.query;

      const reports = await ReportModel.find({
        status,
        ...buildCursorQuery('createdAt', cursor?.toISOString())
      })
        .populate('reporterId', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .lean();

      const response = buildPaginatedResponse(reports.map(r => ({ ...r, id: r._id })), limit);
      res.json(response);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/moderation/:id/hide', authMiddleware, rbacGuard('moderator', 'admin'), async (req, res, next) => {
    try {
      const { targetType } = req.body;

      let result;
      if (targetType === 'post') {
        result = await PostModel.findByIdAndUpdate(
          req.params.id,
          { status: 'hidden' },
          { new: true }
        );
      } else if (targetType === 'comment') {
        result = await CommentModel.findByIdAndUpdate(
          req.params.id,
          { status: 'hidden' },
          { new: true }
        );
      }

      if (!result) {
        return res.status(404).json({ error: 'Content not found' });
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/moderation/reports/:id/resolve', authMiddleware, rbacGuard('moderator', 'admin'), async (req, res, next) => {
    try {
      const report = await ReportModel.findByIdAndUpdate(
        req.params.id,
        { status: 'closed' },
        { new: true }
      );

      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      res.json(report);
    } catch (error) {
      next(error);
    }
  });

  // Upload routes
  app.post('/api/uploads/sign', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const { contentType, filename } = req.body;

      if (!UploadService.validateFileType(contentType)) {
        return res.status(400).json({ error: 'Invalid file type' });
      }

      const { url, key } = await UploadService.generatePresignedUrl(
        filename,
        contentType,
        req.user!.id
      );

      res.json({ url, key, publicUrl: UploadService.getPublicUrl(key) });
    } catch (error) {
      next(error);
    }
  });

  // Notifications routes
  app.get('/api/notifications', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const notifications = await NotificationService.getUserNotifications(req.user!.id);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/notifications/unread-count', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      const count = await NotificationService.getUnreadCount(req.user!.id);
      res.json({ count });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/notifications/:id/read', authMiddleware, async (req: AuthRequest, res, next) => {
    try {
      await NotificationService.markAsRead(req.params.id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Error handling only for API routes - let Vite handle other routes
  app.use('/api', notFoundHandler);
  app.use(errorHandler);

  const httpServer = createServer(app);

  // Initialize WebSocket
  WebSocketService.initialize(httpServer);

  return httpServer;
}
