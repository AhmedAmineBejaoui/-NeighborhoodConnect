import dotenv from "dotenv";
dotenv.config();


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
  
    // Supabase
  SUPABASE_URL: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SUPABASE_BUCKET: z.string().default('community-hub-media'),
  SUPABASE_PUBLIC_BUCKET: z.string().default('true'),
  
  // Spam
  SPAM_THRESHOLD: z.string().transform(Number).default("0.7"),
  POST_MAX_LEN: z.string().transform(Number).default("8000"),
});

export const env = envSchema.parse(process.env);
