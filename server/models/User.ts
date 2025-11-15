import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User as UserType } from '@shared/schema';

export interface UserDocument extends Omit<UserType, 'id'>, Document {
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true
  },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
  roles: [{ 
    type: String, 
    enum: ['admin', 'moderator', 'resident'], 
    default: ['resident'] 
  }],
  communityIds: [{ type: Schema.Types.ObjectId, ref: 'Community' }],
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit' },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.passwordHash;
      return ret;
    }
  }
});

userSchema.index({ communityIds: 1 });

userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

export const UserModel = mongoose.model<UserDocument>('User', userSchema);
