import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import puppeteer, { Browser, Page } from 'puppeteer';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { env } from '@/common/utils/envConfig';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

import {
  getRandomDelay,
  getRandomizedLaunchArgs,
  getRandomUserAgent,
  getRandomViewport,
  setRandomHeaders,
  setupBrowserEvasion,
  simulateHumanBehavior,
} from './browserRandomization';
import {
  HeadlessBrowserReaderRequestParamSchema,
  HeadlessBrowserReaderResponseSchema,
} from './headlessBrowserReaderModel';

export const headlessBrowserReaderRegistry = new OpenAPIRegistry();
headlessBrowserReaderRegistry.register('Headless Browser Reader', HeadlessBrowserReaderResponseSchema);

// Global browser instance for reuse mode (when REUSE_BROWSER_INSTANCE=true)
let browserInstance: Browser | null = null;

const createNewBrowserInstance = async (): Promise<Browser> => {
  const browser = await puppeteer.launch({
    headless: env.HEADLESS,
    args: getRandomizedLaunchArgs(),
    executablePath: env.PUPPETEER_EXECUTABLE_PATH || undefined,
  });
  // Reset reference on disconnect
  browser.on('disconnected', () => {
    if (browserInstance === browser) {
      browserInstance = null;
    }
  });
  return browser;
};

const getBrowserInstance = async (): Promise<Browser> => {
  if (!browserInstance || !browserInstance.connected) {
    browserInstance = await createNewBrowserInstance();
  }
  return browserInstance;
};

const fetchContentWithHeadlessBrowser = async (
  url: string,
  waitForSelector?: string,
  timeout: number = 10000,
  waitStrategy: 'domcontentloaded' | 'load' | 'networkidle0' | 'networkidle2' = 'domcontentloaded'
) => {
  // Choose browser strategy based on environment variable
  const browser = env.REUSE_BROWSER_INSTANCE ? await getBrowserInstance() : await createNewBrowserInstance();
  const page: Page = await browser.newPage();

  try {
    // Randomize user agent
    const userAgent = getRandomUserAgent();
    await page.setUserAgent(userAgent);

    // Randomize viewport
    const viewport = getRandomViewport();
    await page.setViewport(viewport);

    // Set randomized headers
    await setRandomHeaders(page);

    // Setup browser evasion techniques
    await setupBrowserEvasion(page);

    // Add random delay before navigation (simulate human behavior)
    await new Promise((resolve) => setTimeout(resolve, getRandomDelay(500, 2000)));

    // Navigate to the page with configurable waiting strategy
    await page.goto(url, {
      waitUntil: waitStrategy,
      timeout,
    });

    // Random delay after page load (simulate reading time)
    const readingDelay = getRandomDelay(1000, 3000);
    await new Promise((resolve) => setTimeout(resolve, readingDelay));

    // For faster strategies, wait a bit for dynamic content to load
    if (waitStrategy === 'domcontentloaded') {
      await new Promise((resolve) => setTimeout(resolve, getRandomDelay(1500, 3000)));
    }

    // Wait for specific selector if provided
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 5000 });
    }

    // Simulate human-like behavior
    await simulateHumanBehavior(page, viewport);

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

    // Add small delay before closing (simulate human behavior)
    await new Promise((resolve) => setTimeout(resolve, getRandomDelay(500, 1500)));

    return {
      title: pageData.title,
      content: pageData.content,
      url,
    };
  } finally {
    try {
      await page.close();
    } catch {
      // ignore
    }
    // Only close the browser instance if we're not reusing it
    if (!env.REUSE_BROWSER_INSTANCE) {
      try {
        await browser.close();
      } catch {
        // ignore
      }
    }
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
    // Validate request query with zod (runtime)
    const parsed = HeadlessBrowserReaderRequestParamSchema.safeParse(_req.query);
    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join('; ');
      const serviceResponse = new ServiceResponse(ResponseStatus.Failed, message, null, StatusCodes.BAD_REQUEST);
      return handleServiceResponse(serviceResponse, res);
    }

    const { url, waitForSelector, timeout, waitStrategy } = parsed.data;

    try {
      const content = await fetchContentWithHeadlessBrowser(
        url,
        waitForSelector,
        timeout ?? 10000,
        waitStrategy ?? 'domcontentloaded'
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

  // Cleanup route for graceful shutdown (only when reusing browser instances)
  if (env.REUSE_BROWSER_INSTANCE) {
    headlessBrowserReaderRegistry.registerPath({
      method: 'post',
      path: '/api/headless-browser-reader/cleanup',
      tags: ['Headless Browser Reader'],
      responses: createApiResponse(HeadlessBrowserReaderResponseSchema, 'Success'),
      security: [{ ApiKeyAuth: [] }],
    });

    router.post('/cleanup', async (_req: Request, res: Response) => {
      try {
        if (browserInstance && browserInstance.connected) {
          try {
            await browserInstance.close();
          } finally {
            browserInstance = null;
          }
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
  }

  return router;
})();

// Graceful shutdown handlers (only when reusing browser instances)
if (env.REUSE_BROWSER_INSTANCE) {
  const shutdown = async () => {
    if (browserInstance && browserInstance.connected) {
      try {
        await browserInstance.close();
      } finally {
        browserInstance = null;
      }
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
