import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import { pino } from 'pino';

import { openAPIRouter } from '@/api-docs/openAPIRouter';
import { apiKeyAuth, optionalApiKeyAuth } from '@/common/middleware/apiKeyAuth';
import errorHandler from '@/common/middleware/errorHandler';
import rateLimiter from '@/common/middleware/rateLimiter';
import requestLogger from '@/common/middleware/requestLogger';
import { healthCheckRouter } from '@/routes/healthCheck/healthCheckRouter';

import { excelGeneratorRouter } from './routes/excelGenerator/excelGeneratorRouter';
import { fileReaderRouter } from './routes/fileReader/fileReaderRouter';
import { headlessBrowserReaderRouter } from './routes/headlessBrowserReader/headlessBrowserReaderRouter';
import { notionDatabaseRouter } from './routes/notionDatabase/notionDatabaseRouter';
import { powerpointGeneratorRouter } from './routes/powerpointGenerator/powerpointGeneratorRouter';
import { webPageReaderRouter } from './routes/webPageReader/webPageReaderRouter';
import { wordGeneratorRouter } from './routes/wordGenerator/wordGeneratorRouter';
import { youtubeTranscriptRouter } from './routes/youtubeTranscript/youtubeTranscriptRouter';
const logger = pino({ name: 'server start' });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set('trust proxy', true);
// Middlewares
// app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(cors());
app.use(helmet());
app.use(rateLimiter);
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.removeHeader('Content-Security-Policy');
  next();
});
// Request logging
app.use(requestLogger());

// Routes
app.use('/api/health-check', optionalApiKeyAuth, healthCheckRouter);
app.use('/api/images', apiKeyAuth, express.static('public/images'));
app.use('/api/youtube-transcript', apiKeyAuth, youtubeTranscriptRouter);
app.use('/api/web-page-reader', apiKeyAuth, webPageReaderRouter);
app.use('/api/file-reader', apiKeyAuth, fileReaderRouter);
app.use('/api/headless-browser-reader', apiKeyAuth, headlessBrowserReaderRouter);
app.use('/api/powerpoint-generator', apiKeyAuth, powerpointGeneratorRouter);
app.use('/api/word-generator', apiKeyAuth, wordGeneratorRouter);
app.use('/api/excel-generator', apiKeyAuth, excelGeneratorRouter);
app.use('/api/notion-database', apiKeyAuth, notionDatabaseRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
