import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';
import { getMongoConnectionString, displayConnectionInfo } from './mongo-url';

export async function connectDatabase() {
  // Always display the MongoDB connection info
  const mongoUri = displayConnectionInfo();
  
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      maxPoolSize: 10,
      bufferCommands: false,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    
    logger.info('✅ MongoDB connecté avec succès!');
    logger.info(`🔗 URI: ${mongoUri.replace(/:\/\/.*@/, '://****@')}`);
    
    // Create indexes
    await createIndexes();
    
    return true; // MongoDB is connected
  } catch (error) {
    logger.warn('⚠️  MongoDB non disponible, continuez avec stockage en mémoire');
    logger.info('💡 Pour utiliser MongoDB: installez-le localement ou utilisez MongoDB Atlas');
    
    return false; // Fall back to in-memory storage
  }
}

async function createIndexes() {
  try {
    const { UserModel } = await import('../models/User');
    await UserModel.createIndexes();
    logger.info('📊 MongoDB indexes created successfully');
  } catch (error) {
    logger.warn('Index creation failed:', error.message);
  }
}
