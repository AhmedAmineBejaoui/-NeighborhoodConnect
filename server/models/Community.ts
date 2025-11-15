import mongoose, { Schema, Document } from 'mongoose';
import { Community as CommunityType } from '@shared/schema';

export interface CommunityDocument extends Omit<CommunityType, 'id'>, Document {}

const communitySchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  settings: {
    postMaxLength: { type: Number, default: 8000 },
    allowedMediaTypes: [{ type: String, default: ['image/jpeg', 'image/png'] }],
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

export const CommunityModel = mongoose.model<CommunityDocument>('Community', communitySchema);
