import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import puppeteer, { Browser, Page } from 'puppeteer';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

import {
  HeadlessBrowserReaderRequestParamSchema,
  HeadlessBrowserReaderResponseSchema,
} from './headlessBrowserReaderModel';

export const headlessBrowserReaderRegistry = new OpenAPIRegistry();
headlessBrowserReaderRegistry.register('Headless Browser Reader', HeadlessBrowserReaderResponseSchema);

let browserInstance: Browser | null = null;

const getBrowserInstance = async (): Promise<Browser> => {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    });
  }
  return browserInstance;
};

const fetchContentWithHeadlessBrowser = async (
  url: string,
  waitForSelector?: string,
  timeout: number = 10000,
  waitStrategy: 'domcontentloaded' | 'load' | 'networkidle0' | 'networkidle2' = 'domcontentloaded'
) => {
  const browser = await getBrowserInstance();
  const page: Page = await browser.newPage();

  try {
    // Set user agent to avoid bot detection
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to the page with configurable waiting strategy
    await page.goto(url, {
      waitUntil: waitStrategy,
      timeout,
    });

    // For faster strategies, wait a bit for dynamic content to load
    if (waitStrategy === 'domcontentloaded') {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Wait for specific selector if provided
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 5000 });
    }

    // Extract title and content
    const pageData = await page.evaluate(() => {
      // Remove unwanted elements
      const elementsToRemove = [
        'script',
        'style',
        'nav',
        'header',
        'footer',
        'aside',
        '.advertisement',
        '.ads',
        '.sidebar',
        '[class*="ad-"]',
        '[id*="ad-"]',
      ];

      elementsToRemove.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => el.remove());
      });

      const title = document.title || '';

      // Try to get main content area first
      const contentElement =
        document.querySelector('main') ||
        document.querySelector('article') ||
        document.querySelector('[role="main"]') ||
        document.querySelector('.content') ||
        document.querySelector('#content') ||
        document.body;

      const content = contentElement?.innerText || '';

      return { title, content };
    });

    return {
      title: pageData.title,
      content: pageData.content,
      url,
    };
  } finally {
    await page.close();
  }
};

export const headlessBrowserReaderRouter: Router = (() => {
  const router = express.Router();

  headlessBrowserReaderRegistry.registerPath({
    method: 'get',
    path: '/api/headless-browser-reader/get-content',
    tags: ['Headless Browser Reader'],
    request: {
      query: HeadlessBrowserReaderRequestParamSchema,
    },
    responses: createApiResponse(HeadlessBrowserReaderResponseSchema, 'Success'),
    security: [{ ApiKeyAuth: [] }],
  });

  router.get('/get-content', async (_req: Request, res: Response) => {
    const { url, waitForSelector, timeout, waitStrategy } = _req.query;

    if (typeof url !== 'string') {
      const serviceResponse = new ServiceResponse(
        ResponseStatus.Failed,
        'URL must be a string',
        null,
        StatusCodes.BAD_REQUEST
      );
      return handleServiceResponse(serviceResponse, res);
    }

    const timeoutMs = timeout ? Number(timeout) : 10000;

    if (isNaN(timeoutMs) || timeoutMs < 1000 || timeoutMs > 30000) {
      const serviceResponse = new ServiceResponse(
        ResponseStatus.Failed,
        'Timeout must be a number between 1000 and 30000',
        null,
        StatusCodes.BAD_REQUEST
      );
      return handleServiceResponse(serviceResponse, res);
    }

    // Validate wait strategy
    const validStrategies = ['domcontentloaded', 'load', 'networkidle0', 'networkidle2'];
    const strategy =
      waitStrategy && validStrategies.includes(waitStrategy as string)
        ? (waitStrategy as 'domcontentloaded' | 'load' | 'networkidle0' | 'networkidle2')
        : 'domcontentloaded';

    try {
      const content = await fetchContentWithHeadlessBrowser(
        url,
        waitForSelector as string | undefined,
        timeoutMs,
        strategy
      );

      const serviceResponse = new ServiceResponse(
        ResponseStatus.Success,
        'Content fetched successfully using headless browser',
        content,
        StatusCodes.OK
      );
      return handleServiceResponse(serviceResponse, res);
    } catch (error) {
      console.error(`Error fetching content with headless browser: ${(error as Error).message}`);
      const errorMessage = `Error fetching content with headless browser: ${(error as Error).message}`;
      const serviceResponse = new ServiceResponse(
        ResponseStatus.Failed,
        errorMessage,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
      return handleServiceResponse(serviceResponse, res);
    }
  });

  // Cleanup route for graceful shutdown
  router.post('/cleanup', async (_req: Request, res: Response) => {
    try {
      if (browserInstance && browserInstance.isConnected()) {
        await browserInstance.close();
        browserInstance = null;
      }
      const serviceResponse = new ServiceResponse(
        ResponseStatus.Success,
        'Browser instance cleaned up successfully',
        null,
        StatusCodes.OK
      );
      return handleServiceResponse(serviceResponse, res);
    } catch (error) {
      console.error(`Error cleaning up browser: ${(error as Error).message}`);
      const serviceResponse = new ServiceResponse(
        ResponseStatus.Failed,
        `Error cleaning up browser: ${(error as Error).message}`,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
      return handleServiceResponse(serviceResponse, res);
    }
  });

  return router;
})();

// Graceful shutdown handler
process.on('SIGINT', async () => {
  if (browserInstance && browserInstance.isConnected()) {
    await browserInstance.close();
  }
});

process.on('SIGTERM', async () => {
  if (browserInstance && browserInstance.isConnected()) {
    await browserInstance.close();
  }
});
