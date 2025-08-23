import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    env: {
      NODE_ENV: 'test',
      API_KEY: 'test-api-key-for-testing',
      CORS_ORIGIN: '*',
      HOST: 'localhost',
      PORT: '3000',
      COMMON_RATE_LIMIT_MAX_REQUESTS: '100',
      COMMON_RATE_LIMIT_WINDOW_MS: '60000',
    },
  },
  plugins: [tsconfigPaths()],
});
