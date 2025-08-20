import mongoose, { Schema, Document } from 'mongoose';
import { Post as PostType } from '@shared/schema';

export interface PostDocument extends Omit<PostType, 'id'>, Document {}

const postSchema = new Schema({
  communityId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Community', 
    required: true, 
    index: true 
  },
  authorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  type: { 
    type: String, 
    enum: ['announcement', 'service', 'market', 'poll'], 
    required: true,
    index: true 
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  tags: [{ type: String }],
  status: { 
    type: String, 
    enum: ['published', 'hidden'], 
    default: 'published',
    index: true 
  },
  meta: {
    price: { type: Number },
    images: [{ type: String }],
    options: [{ type: String }],
  },
  expiresAt: { type: Date, index: true },
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

// Text search index
postSchema.index({ title: 'text', body: 'text' });

// Compound indexes
postSchema.index({ communityId: 1, createdAt: -1 });
postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });

// TTL index for expiration
postSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PostModel = mongoose.model<PostDocument>('Post', postSchema);
