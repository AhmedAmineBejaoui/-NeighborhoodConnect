import mongoose, { Schema, Document } from 'mongoose';
import { Vote as VoteType } from '@shared/schema';

export interface VoteDocument extends Omit<VoteType, 'id'>, Document {}

const voteSchema = new Schema({
  postId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true, 
    index: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  optionIndex: { type: Number, required: true },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Unique constraint to ensure one vote per user per post
voteSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const VoteModel = mongoose.model<VoteDocument>('Vote', voteSchema);
