import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { env } from '@/common/utils/envConfig';
import { app } from '@/server';

describe('Headless Browser Reader API', () => {
  it('should require URL parameter', async () => {
    const response = await request(app)
      .get('/api/headless-browser-reader/get-content')
      .set('x-api-key', 'test-api-key-for-testing');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('URL must be a string');
  });

  it('should validate timeout parameter', async () => {
    const response = await request(app)
      .get('/api/headless-browser-reader/get-content')
      .query({ url: 'https://example.com', timeout: '500' })
      .set('x-api-key', 'test-api-key-for-testing');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Timeout must be a number between 1000 and 30000');
  });

  // Only test cleanup endpoint when browser reuse is enabled
  if (env.REUSE_BROWSER_INSTANCE) {
    it('should handle cleanup endpoint', async () => {
      const response = await request(app)
        .post('/api/headless-browser-reader/cleanup')
        .set('x-api-key', 'test-api-key-for-testing');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Browser instance cleaned up successfully');
    });
  }
});
