import mongoose from 'mongoose';
import { connectDB } from '../connection';

async function seed() {
  await connectDB();
  // TODO: add seeding logic
  console.log('seed database with demo data');
  await mongoose.connection.close();
}

seed();
