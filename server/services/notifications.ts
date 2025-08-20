import { NotificationModel } from '../models/Notification';
import { InsertNotification } from '@shared/schema';
import { logger } from '../config/logger';

export class NotificationService {
  static async create(notification: InsertNotification) {
    try {
      const newNotification = new NotificationModel(notification);
      await newNotification.save();
      
      // Emit via WebSocket (will be handled by WebSocket service)
      return newNotification.toJSON();
    } catch (error) {
      logger.error('Failed to create notification:', error);
      throw error;
    }
  }

  static async getUserNotifications(userId: string, limit: number = 20) {
    try {
      const notifications = await NotificationModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      
      return notifications.map(n => ({ ...n, id: n._id }));
    } catch (error) {
      logger.error('Failed to get user notifications:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string, userId: string) {
    try {
      await NotificationModel.findOneAndUpdate(
        { _id: notificationId, userId },
        { readAt: new Date() }
      );
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    try {
      return await NotificationModel.countDocuments({
        userId,
        readAt: { $exists: false }
      });
    } catch (error) {
      logger.error('Failed to get unread count:', error);
      return 0;
    }
  }

  // Notification types
  static async notifyNewPost(postId: string, communityId: string, authorId: string) {
    // Notify all community members except the author
    const notification: InsertNotification = {
      userId: '', // Will be set for each user
      type: 'post.created',
      payload: { postId, communityId, authorId }
    };

    // This would normally query all community members and create notifications
    // For now, we'll create a placeholder
    logger.info(`New post notification created for post ${postId}`);
  }

  static async notifyNewComment(commentId: string, postId: string, authorId: string) {
    const notification: InsertNotification = {
      userId: '', // Will be set for post author
      type: 'comment.created',
      payload: { commentId, postId, authorId }
    };

    logger.info(`New comment notification created for comment ${commentId}`);
  }

  static async notifyReportOpened(reportId: string, targetType: string, targetId: string) {
    const notification: InsertNotification = {
      userId: '', // Will be set for moderators
      type: 'report.opened',
      payload: { reportId, targetType, targetId }
    };

    logger.info(`Report notification created for report ${reportId}`);
  }
}
