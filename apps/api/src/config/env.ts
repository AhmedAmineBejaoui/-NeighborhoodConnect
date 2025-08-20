import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development','production']).default('development'),
  PORT: z.coerce.number().default(8080),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/communityhub'),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  SPAM_THRESHOLD: z.coerce.number().default(0.7),
  POST_MAX_LEN: z.coerce.number().default(8000)
});

const env = envSchema.parse(process.env);
export default env;
