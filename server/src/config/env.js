import dotenv from 'dotenv';
import { z } from 'zod';

// Load variables from server/.env if present
dotenv.config();

/**
 * Environment Schema Definition with Zod validation
 */
const envSchema = z.object({
  PORT: z.coerce.number().positive().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required').default('mongodb://127.0.0.1:27017/freelance_marketplace'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters').default('dev_jwt_secret_workbridge_key_32chars_long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(8, 'COOKIE_SECRET must be at least 8 characters').default('dev_cookie_secret_workbridge_32chars_long'),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default('')
});

// Normalize MongoDB URI from either MONGODB_URI or MONGO_URI
const rawEnv = {
  ...process.env,
  MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freelance_marketplace'
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.error('[Config] Environment variable validation failed:');
  parsed.error.issues.forEach(issue => {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  });

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Fatal: Invalid production environment configuration.');
  }
}

export const ENV = parsed.success ? parsed.data : envSchema.parse({});
export default ENV;
