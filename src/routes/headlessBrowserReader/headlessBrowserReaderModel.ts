import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export type HeadlessBrowserReaderRequest = z.infer<typeof HeadlessBrowserReaderRequestParamSchema>;
export type HeadlessBrowserReaderResponse = z.infer<typeof HeadlessBrowserReaderResponseSchema>;

export const HeadlessBrowserReaderRequestParamSchema = z.object({
  url: z
    .string({ required_error: 'URL must be a string' })
    .max(2048, 'URL is too long')
    .url('Please provide a valid URL')
    .refine((u) => {
      try {
        const p = new URL(u);
        return p.protocol === 'http:' || p.protocol === 'https:';
      } catch {
        return false;
      }
    }, 'URL must use http or https protocol')
    .openapi({
      example: 'https://example.com',
      description: 'The URL of the web page to read using headless browser',
    }),
  waitForSelector: z.string().optional().openapi({
    example: '.content',
    description: 'CSS selector to wait for before extracting content (optional)',
  }),
  timeout: z.coerce
    .number()
    .int()
    .min(1000, 'Timeout must be a number between 1000 and 30000')
    .max(30000, 'Timeout must be a number between 1000 and 30000')
    .default(15000)
    .optional()
    .openapi({
      example: 15000,
      description: 'Timeout in milliseconds for page loading (1000-30000, default: 15000)',
    }),
  waitStrategy: z
    .enum(['domcontentloaded', 'load', 'networkidle0', 'networkidle2'])
    .default('domcontentloaded')
    .optional()
    .openapi({
      example: 'domcontentloaded',
      description:
        'Strategy for waiting for page load. domcontentloaded (fastest, good for most pages), load (waits for all resources), networkidle0 (waits for no network activity), networkidle2 (waits for minimal network activity)',
    }),
});

export const HeadlessBrowserReaderResponseSchema = z.object({
  title: z.string().openapi({
    example: 'Example Page Title',
    description: 'The title of the web page',
  }),
  content: z.string().openapi({
    example: 'This is the main content of the web page...',
    description: 'The extracted text content from the web page',
  }),
  url: z.string().url().openapi({
    example: 'https://example.com',
    description: 'The URL that was processed',
  }),
});
