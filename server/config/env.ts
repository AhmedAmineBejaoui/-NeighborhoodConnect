import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.string().transform(Number).default("5000"),
  
  // JWT
  JWT_ACCESS_SECRET: z.string().default('access-secret-dev'),
  JWT_REFRESH_SECRET: z.string().default('refresh-secret-dev'),
  REFRESH_TOKEN_TTL_DAYS: z.string().transform(Number).default("30"),
  
  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:5000'),
  
  // Database
  DATABASE_URL: z.string().default('mongodb://localhost:27017/community-hub'),
  
  // S3
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().default('community-hub-media'),
  S3_ACCESS_KEY: z.string().default('placeholder-access-key'),
  S3_SECRET_KEY: z.string().default('placeholder-secret-key'),
  
  // Spam
  SPAM_THRESHOLD: z.string().transform(Number).default("0.7"),
  POST_MAX_LEN: z.string().transform(Number).default("8000"),
});

export const env = envSchema.parse(process.env);
