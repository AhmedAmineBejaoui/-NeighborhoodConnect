import { env } from './env';

// MongoDB Connection URL Generator
export function getMongoConnectionString(): string {
  // MongoDB Atlas URL - URL fournie par l'utilisateur
  const atlasUrl = 'mongodb+srv://bejaouiahmed053:YOUR_PASSWORD@voisinageconnect.v00shez.mongodb.net/community-hub?retryWrites=true&w=majority&appName=VoisinageConnect';
  
  // Use environment variable or Atlas URL
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.startsWith('mongodb')) {
    return envUrl;
  }
  
  // For Replit environment, construct URL
  if (process.env.REPL_ID) {
    // Replit internal MongoDB service (if available)
    const replitUrl = `mongodb://mongodb:27017/community-hub-${process.env.REPL_ID}`;
    return replitUrl;
  }
  
  return atlasUrl;
}

export function displayConnectionInfo() {
  const connectionString = getMongoConnectionString();
  
  console.log('\n🔥 MONGODB CONNECTION STRING POUR VOTRE PROJET:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 URL: ${connectionString}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('\n🛠️  INSTRUCTIONS DE CONFIGURATION:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Pour MongoDB local:');
  console.log('   DATABASE_URL=mongodb://localhost:27017/community-hub');
  console.log('');
  console.log('2. Pour MongoDB Atlas (cloud):');
  console.log('   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/community-hub');
  console.log('');
  console.log('3. Pour MongoDB avec authentification:');
  console.log('   DATABASE_URL=mongodb://username:password@localhost:27017/community-hub?authSource=admin');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  return connectionString;
}