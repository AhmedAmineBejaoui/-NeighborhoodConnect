import mongoose, { Schema, Document } from 'mongoose';
import { Report as ReportType } from '@shared/schema';

export interface ReportDocument extends Omit<ReportType, 'id'>, Document {}

const reportSchema = new Schema({
  targetType: { 
    type: String, 
    enum: ['post', 'comment', 'user'], 
    required: true 
  },
  targetId: { 
    type: Schema.Types.ObjectId, 
    required: true, 
    index: true 
  },
  reporterId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['open', 'closed'], 
    default: 'open',
    index: true 
  },
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

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });

export const ReportModel = mongoose.model<ReportDocument>('Report', reportSchema);
