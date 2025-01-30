import { config } from 'dotenv';
import { resolve } from 'path';

// Load test environment variables
config({
  path: resolve(__dirname, '../../.env.test'),
});

// Ensure required environment variables are set
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'TAVILY_API_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is not set`);
  }
}

// Set test-specific environment variables
process.env.VITE_APP_ENV = 'test'; 