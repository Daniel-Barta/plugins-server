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
