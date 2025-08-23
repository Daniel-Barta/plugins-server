import express, { Express } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

import { apiKeyAuth, optionalApiKeyAuth } from '../apiKeyAuth';

describe('API Key Authentication Middleware', () => {
  let app: Express;
  const testApiKey = 'test-api-key-for-testing';

  beforeAll(() => {
    // Ensure the test API key is set
    process.env.API_KEY = testApiKey;

    app = express();

    // Test routes with apiKeyAuth
    app.get('/protected', apiKeyAuth, (_req, res) => {
      res.status(StatusCodes.OK).json({ message: 'Access granted' });
    });

    // Test routes with optionalApiKeyAuth
    app.get('/optional', optionalApiKeyAuth, (_req, res) => {
      res.status(StatusCodes.OK).json({ message: 'Access granted' });
    });
  });

  describe('apiKeyAuth', () => {
    it('should allow access when valid API key is provided in header', async () => {
      const response = await request(app).get('/protected').set('x-api-key', testApiKey);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.message).toBe('Access granted');
    });

    it('should allow access when valid API key is provided in query parameter', async () => {
      const response = await request(app).get('/protected').query({ apiKey: testApiKey });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.message).toBe('Access granted');
    });

    it('should return 401 when no API key is provided', async () => {
      const response = await request(app).get('/protected');

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        'API key is required. Provide it via x-api-key header or apiKey query parameter.'
      );
    });

    it('should return 401 when invalid API key is provided in header', async () => {
      const response = await request(app).get('/protected').set('x-api-key', 'invalid-key');

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid API key provided.');
    });

    it('should return 401 when invalid API key is provided in query parameter', async () => {
      const response = await request(app).get('/protected').query({ apiKey: 'invalid-key' });

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid API key provided.');
    });

    it('should prefer header over query parameter when both are provided', async () => {
      const response = await request(app)
        .get('/protected')
        .set('x-api-key', testApiKey)
        .query({ apiKey: 'invalid-key' });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.message).toBe('Access granted');
    });
  });

  describe('optionalApiKeyAuth', () => {
    it('should allow access when no API key is provided', async () => {
      const response = await request(app).get('/optional');

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.message).toBe('Access granted');
    });

    it('should allow access when valid API key is provided', async () => {
      const response = await request(app).get('/optional').set('x-api-key', testApiKey);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.message).toBe('Access granted');
    });

    it('should return 401 when invalid API key is provided', async () => {
      const response = await request(app).get('/optional').set('x-api-key', 'invalid-key');

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid API key provided.');
    });
  });
});
