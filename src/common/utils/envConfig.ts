import dotenv from 'dotenv';
import { bool, cleanEnv, host, num, port, str } from 'envalid';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'production' }),
  HOST: host({ default: 'localhost' }),
  PORT: port({ default: 3000 }),
  CORS_ORIGIN: str({ default: '*' }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ default: 100 }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ default: 60000 }),
  API_KEY: str({
    desc: 'API key for authentication',
    default: isTest ? 'test-api-key-for-testing' : undefined,
  }),
  REUSE_BROWSER_INSTANCE: bool({
    desc: 'Whether to reuse browser instances across requests for better performance',
    default: false,
  }),
  HEADLESS: bool({
    desc: 'Run Puppeteer in headless mode',
    default: true,
  }),
  PUPPETEER_EXECUTABLE_PATH: str({
    desc: 'Optional custom executable path for puppeteer',
    default: undefined,
  }),
});
