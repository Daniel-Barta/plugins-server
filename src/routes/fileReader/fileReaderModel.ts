import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export type FileReaderResponse = z.infer<typeof FileReaderResponseSchema>;
export const FileReaderResponseSchema = z.object({
  data: z.string().describe('The content of the file'),
  mime_type: z.string().describe('The MIME type of the file content'),
  encoding: z.enum(['utf-8', 'base64']).describe('Encoding of the data field'),
  size: z.number().int().nonnegative().optional().describe('Size of the original file content in bytes'),
});

export type FileReaderRequestParam = z.infer<typeof FileReaderRequestParamSchema>;
export const FileReaderRequestParamSchema = z.object({
  url: z.string().describe('The URL of the file to retrieve content from'),
});
