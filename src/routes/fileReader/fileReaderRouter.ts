import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import got from 'got';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

import { FileReaderRequestParamSchema, FileReaderResponseSchema } from './fileReaderModel';

export const fileReaderRegistry = new OpenAPIRegistry();
fileReaderRegistry.register('File Reader', FileReaderResponseSchema);

const getMimeType = (url: string, contentType?: string): string => {
  // If content-type header is available, use it
  if (contentType) {
    return contentType.split(';')[0].trim();
  }

  // Fallback to file extension detection
  const extension = url.split('.').pop()?.toLowerCase();
  const mimeTypeMap: Record<string, string> = {
    txt: 'text/plain',
    html: 'text/html',
    htm: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    xml: 'application/xml',
    csv: 'text/csv',
    md: 'text/markdown',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };

  return mimeTypeMap[extension || ''] || 'application/octet-stream';
};

const fetchFileContent = async (url: string) => {
  try {
    const response = await got(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const contentType = response.headers['content-type'];
    const mimeType = getMimeType(url, contentType);

    // Access raw binary body (compatible with newer got). Types may not include rawBody, so cast.
    const buffer: Buffer =
      (response as any).rawBody ??
      (Buffer.isBuffer((response as any).body) ? (response as any).body : Buffer.from((response as any).body));

    // Consider these as text; everything else treated as binary
    const isText =
      mimeType.startsWith('text/') ||
      mimeType.includes('json') ||
      mimeType.includes('javascript') ||
      mimeType.includes('xml') ||
      mimeType === 'image/svg+xml';

    if (!isText) {
      // Binary or forced base64 -> base64
      return {
        data: buffer.toString('base64'),
        mime_type: mimeType,
        encoding: 'base64' as const,
        size: buffer.byteLength,
      };
    }

    // Text (and not forced base64) -> UTF-8 string
    return {
      data: buffer.toString('utf-8'),
      mime_type: mimeType,
      encoding: 'utf-8' as const,
      size: buffer.byteLength,
    };
  } catch (error) {
    throw new Error(`Failed to fetch file content: ${(error as Error).message}`);
  }
};

export const fileReaderRouter: Router = (() => {
  const router = express.Router();

  fileReaderRegistry.registerPath({
    method: 'get',
    path: '/api/file-reader/get-content',
    tags: ['File Reader'],
    operationId: 'getFileContent',
    summary: 'Fetch file content from a URL',
    description:
      'Downloads a file from the provided URL and returns its content. Text files are returned as UTF-8, while binary files are returned as base64 along with MIME type and size.',
    request: {
      query: FileReaderRequestParamSchema,
    },
    responses: {
      ...createApiResponse(FileReaderResponseSchema, 'Success', StatusCodes.OK),
      ...createApiResponse(z.null(), 'Bad Request', StatusCodes.BAD_REQUEST),
      ...createApiResponse(z.null(), 'Unauthorized', StatusCodes.UNAUTHORIZED),
      ...createApiResponse(z.null(), 'Too Many Requests', StatusCodes.TOO_MANY_REQUESTS),
      ...createApiResponse(z.null(), 'Internal Server Error', StatusCodes.INTERNAL_SERVER_ERROR),
    },
    security: [{ ApiKeyAuth: [] }],
  });

  router.get('/get-content', async (_req: Request, res: Response) => {
    const { url } = _req.query;

    if (typeof url !== 'string') {
      const serviceResponse = new ServiceResponse(
        ResponseStatus.Failed,
        'URL must be a string',
        null,
        StatusCodes.BAD_REQUEST
      );
      return handleServiceResponse(serviceResponse, res);
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (_e) {
      const serviceResponse = new ServiceResponse(
        ResponseStatus.Failed,
        'Invalid URL format',
        null,
        StatusCodes.BAD_REQUEST
      );
      return handleServiceResponse(serviceResponse, res);
    }

    try {
      const content = await fetchFileContent(url);
      const serviceResponse = new ServiceResponse(
        ResponseStatus.Success,
        'File content fetched successfully',
        content,
        StatusCodes.OK
      );
      return handleServiceResponse(serviceResponse, res);
    } catch (error) {
      console.error(`Error fetching file content: ${(error as Error).message}`);
      const errorMessage = `Error fetching file content: ${(error as Error).message}`;
      const serviceResponse = new ServiceResponse(
        ResponseStatus.Failed,
        errorMessage,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
      return handleServiceResponse(serviceResponse, res);
    }
  });

  return router;
})();
