import { env } from '@/common/utils/envConfig';
import { app, logger } from '@/server';

const port = env.PORT;
const host = env.HOST;

const server = app.listen(port, host, () => {
  const { NODE_ENV, HOST } = env;
  logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${port}`);
});

const onCloseSignal = () => {
  logger.info('sigint received, shutting down');
  server.close(() => {
    logger.info('server closed');
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGINT', onCloseSignal);
process.on('SIGTERM', onCloseSignal);
