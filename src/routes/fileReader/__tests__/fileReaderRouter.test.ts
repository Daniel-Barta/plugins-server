import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '@/server';

describe('File Reader API endpoints', () => {
  describe('GET /api/file-reader/get-content', () => {
    it('should return 400 when url parameter is missing', async () => {
      // Act
      const response = await request(app)
        .get('/api/file-reader/get-content')
        .set('x-api-key', 'test-api-key-for-testing');

      // Assert
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.message).toContain('URL must be a string');
    });

    it('should return 400 when url parameter is invalid', async () => {
      // Act
      const response = await request(app)
        .get('/api/file-reader/get-content')
        .query({ url: 'invalid-url' })
        .set('x-api-key', 'test-api-key-for-testing');

      // Assert
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.message).toContain('Invalid URL format');
    });

    // Note: Testing with actual URLs would require mocking the got library
    // or using a test server to avoid making real HTTP requests in tests
  });
});
