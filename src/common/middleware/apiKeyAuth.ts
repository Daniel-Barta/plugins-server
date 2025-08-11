import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { env } from '@/common/utils/envConfig';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

/**
 * API Key Authentication Middleware
 * Validates API key from 'x-api-key' header or 'apiKey' query parameter
 */
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    const serviceResponse = new ServiceResponse(
      ResponseStatus.Failed,
      'API key is required. Provide it via x-api-key header or apiKey query parameter.',
      null,
      StatusCodes.UNAUTHORIZED
    );
    handleServiceResponse(serviceResponse, res);
    return;
  }

  if (apiKey !== env.API_KEY) {
    const serviceResponse = new ServiceResponse(
      ResponseStatus.Failed,
      'Invalid API key provided.',
      null,
      StatusCodes.UNAUTHORIZED
    );
    handleServiceResponse(serviceResponse, res);
    return;
  }

  // API key is valid, proceed to next middleware
  next();
};

/**
 * Optional API Key Authentication Middleware
 * Validates API key if provided, but allows requests without API key to continue
 * Useful for endpoints that might have different access levels
 */
export const optionalApiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  // If no API key provided, continue without authentication
  if (!apiKey) {
    next();
    return;
  }

  // If API key is provided, it must be valid
  if (apiKey !== env.API_KEY) {
    const serviceResponse = new ServiceResponse(
      ResponseStatus.Failed,
      'Invalid API key provided.',
      null,
      StatusCodes.UNAUTHORIZED
    );
    handleServiceResponse(serviceResponse, res);
    return;
  }

  // API key is valid, proceed to next middleware
  next();
};
