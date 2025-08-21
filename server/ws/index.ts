import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { verifyToken } from '../services/auth.service';
import { UserModel } from '../models/User';
import { logger } from '../config/logger';
import url from 'url';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  communityIds?: string[];
}

export class WebSocketService {
  private static wss: WebSocketServer;
  private static clients = new Map<string, AuthenticatedWebSocket>();
  private static communityRooms = new Map<string, Set<string>>();

  static initialize(server: Server) {
    this.wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (req, socket, head) => {
      const { pathname } = new URL(req.url || '', `http://${req.headers.host}`);
      if (pathname === '/ws') {
        this.wss.handleUpgrade(req, socket, head, (ws) => {
          this.wss.emit('connection', ws, req);
        });
      }
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    logger.info('WebSocket server initialized');
  }

  private static async handleConnection(ws: AuthenticatedWebSocket, req: any) {
    try {
      const query = url.parse(req.url, true).query;
      const token = query.token as string;

      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      const decoded = verifyToken(token);
      const user = await UserModel.findById(decoded.userId).lean();

      if (!user) {
        ws.close(1008, 'Invalid user');
        return;
      }

      ws.userId = user._id.toString();
      ws.communityIds = user.communityIds.map((id: any) => id.toString());

      // Store client
      this.clients.set(ws.userId, ws);

      // Join community rooms
      for (const communityId of ws.communityIds) {
        this.joinRoom(ws.userId, `community:${communityId}`);
      }

      // Join personal room
      this.joinRoom(ws.userId, `user:${ws.userId}`);

      logger.info(`WebSocket client connected: ${ws.userId}`);

      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      ws.on('message', (data) => {
        this.handleMessage(ws, data);
      });

      // Send welcome message
      this.sendToUser(ws.userId, {
        type: 'connected',
        payload: { userId: ws.userId }
      });

    } catch (error) {
      logger.error(error as Error, 'WebSocket authentication error');
      ws.close(1008, 'Authentication failed');
    }
  }

  private static handleDisconnection(ws: AuthenticatedWebSocket) {
    if (ws.userId) {
      const userId = ws.userId;
      this.clients.delete(userId);

      // Leave all rooms
      this.communityRooms.forEach((users, roomId) => {
        users.delete(userId);
        if (users.size === 0) {
          this.communityRooms.delete(roomId);
        }
      });

      logger.info(`WebSocket client disconnected: ${userId}`);
    }
  }

  private static handleMessage(ws: AuthenticatedWebSocket, data: any) {
    try {
      const message = JSON.parse(data.toString());
      logger.debug('WebSocket message received:', message);

      // Handle different message types
      switch (message.type) {
        case 'ping':
          this.sendToUser(ws.userId!, { type: 'pong', payload: {} });
          break;
        default:
          logger.warn('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      logger.error(error as Error, 'WebSocket message error');
    }
  }

  private static joinRoom(userId: string, roomId: string) {
    if (!this.communityRooms.has(roomId)) {
      this.communityRooms.set(roomId, new Set());
    }
    this.communityRooms.get(roomId)!.add(userId);
  }

  static sendToUser(userId: string, message: any) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  static sendToRoom(roomId: string, message: any, excludeUserId?: string) {
    const users = this.communityRooms.get(roomId);
    if (!users) return;

    users.forEach((userId) => {
      if (userId !== excludeUserId) {
        this.sendToUser(userId, message);
      }
    });
  }

  static sendToCommunity(communityId: string, message: any, excludeUserId?: string) {
    this.sendToRoom(`community:${communityId}`, message, excludeUserId);
  }

  // Event emitters for business logic
  static emitPostCreated(post: any) {
    this.sendToCommunity(post.communityId, {
      type: 'post.created',
      payload: post
    }, post.authorId);
  }

  static emitCommentCreated(comment: any, postId: string, communityId: string) {
    this.sendToRoom(`post:${postId}`, {
      type: 'comment.created',
      payload: comment
    }, comment.authorId);
  }

  static emitPollTally(postId: string, communityId: string, tally: any) {
    this.sendToCommunity(communityId, {
      type: 'poll.tally',
      payload: { postId, tally }
    });
  }

  static emitNotification(userId: string, notification: any) {
    this.sendToUser(userId, {
      type: 'notification',
      payload: notification
    });
  }

  static emitReportOpened(report: any) {
    // Send to all moderators and admins
    this.clients.forEach((_client, userId) => {
      // This would need to check user roles
      this.sendToUser(userId, {
        type: 'report.opened',
        payload: report
      });
    });
  }
}
