import mongoose from 'mongoose';
import env from '../config/env';

export async function connectDB() {
  await mongoose.connect(env.MONGODB_URI);
}
