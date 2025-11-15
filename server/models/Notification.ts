import mongoose, { Schema, Document } from 'mongoose';
import { Notification as NotificationType } from '@shared/schema';

export interface NotificationDocument extends Omit<NotificationType, 'id'>, Document {}

const notificationSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  type: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, required: true },
  readAt: { type: Date },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, readAt: 1 });

export const NotificationModel = mongoose.model<NotificationDocument>('Notification', notificationSchema);
