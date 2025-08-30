import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { excelGeneratorRegistry } from '@/routes/excelGenerator/excelGeneratorRouter';
import { fileReaderRegistry } from '@/routes/fileReader/fileReaderRouter';
import { headlessBrowserReaderRegistry } from '@/routes/headlessBrowserReader/headlessBrowserReaderRouter';
import { healthCheckRegistry } from '@/routes/healthCheck/healthCheckRouter';
import { notionDatabaseRegistry } from '@/routes/notionDatabase/notionDatabaseRouter';
import { powerpointGeneratorRegistry } from '@/routes/powerpointGenerator/powerpointGeneratorRouter';
import { articleReaderRegistry } from '@/routes/webPageReader/webPageReaderRouter';
import { wordGeneratorRegistry } from '@/routes/wordGenerator/wordGeneratorRouter';
import { youtubeTranscriptRegistry } from '@/routes/youtubeTranscript/youtubeTranscriptRouter';

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([
    healthCheckRegistry,
    youtubeTranscriptRegistry,
    articleReaderRegistry,
    fileReaderRegistry,
    headlessBrowserReaderRegistry,
    powerpointGeneratorRegistry,
    wordGeneratorRegistry,
    excelGeneratorRegistry,
    notionDatabaseRegistry,
  ]);

  // Register API key security scheme
  registry.registerComponent('securitySchemes', 'ApiKeyAuth', {
    type: 'apiKey',
    in: 'header',
    name: 'x-api-key',
    description: 'API key for authentication. Can also be provided as query parameter "apiKey".',
  });

  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Plugins Server API',
      description: 'API for various plugin services requiring authentication',
    },
    // Describe tags so tools (e.g., OpenAPI->MCP bridges) show helpful summaries
    tags: [
      {
        name: 'Health Check',
        description: 'Simple health probe for the server.',
      },
      {
        name: 'Youtube Transcript',
        description: 'Fetch the transcript of a YouTube video.',
      },
      {
        name: 'Web Page Reader',
        description: 'Extract clean text content from a public web page.',
      },
      {
        name: 'File Reader',
        description:
          'Download file content from a URL. Returns utf-8 for text or base64 for binary, along with MIME type and size.',
      },
      {
        name: 'Headless Browser Reader',
        description:
          'Use a headless browser (Puppeteer) to load pages with basic anti-bot randomization and extract article text.',
      },
      {
        name: 'Powerpoint Generator',
        description: 'Generate a PPTX presentation from structured input.',
      },
      {
        name: 'Word Generator',
        description: 'Generate a DOCX document from structured input.',
      },
      {
        name: 'Excel Generator',
        description: 'Generate an XLSX spreadsheet from structured input.',
      },
      {
        name: 'Notion Database',
        description:
          'Interact with Notion databases: view structure, create/update/archive pages, query pages, and create databases.',
      },
    ],
    externalDocs: {
      description: 'View the raw OpenAPI Specification in JSON format',
      url: '/swagger.json',
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
  });
}
