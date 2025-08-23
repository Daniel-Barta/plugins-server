import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import puppeteer, { Browser, Page } from 'puppeteer';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
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

const createNewBrowserInstance = async (): Promise<Browser> => {
  return await puppeteer.launch({
    headless: true, // Keep as boolean for compatibility
    args: getRandomizedLaunchArgs(),
  });
};

const fetchContentWithHeadlessBrowser = async (
  url: string,
  waitForSelector?: string,
  timeout: number = 10000,
  waitStrategy: 'domcontentloaded' | 'load' | 'networkidle0' | 'networkidle2' = 'domcontentloaded'
) => {
  const browser = await createNewBrowserInstance();
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
    await page.close();
    // Close the browser instance since we create a new one for each request
    await browser.close();
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

  return router;
})();
