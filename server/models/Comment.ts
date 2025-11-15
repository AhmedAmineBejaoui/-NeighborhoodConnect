import mongoose, { Schema, Document } from 'mongoose';
import { Comment as CommentType } from '@shared/schema';

export interface CommentDocument extends Omit<CommentType, 'id'>, Document {}

const commentSchema = new Schema({
  postId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true, 
    index: true 
  },
  authorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  body: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['published', 'hidden'], 
    default: 'published' 
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

commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ authorId: 1, createdAt: -1 });

export const CommentModel = mongoose.model<CommentDocument>('Comment', commentSchema);
