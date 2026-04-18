import http from 'http';
import initApp from './app.js';
import environment from './configs/environment.js';
import prismaClient from './libs/database.js';
import redisClient from './libs/redis.js';
import { logger } from './libs/winston.js';
import { initSocketServer } from './socket/socketManager.js';

const startServer = async () => {
  try {
    await redisClient.connect();
    await prismaClient.$connect().then(() => logger.info('✅ Database connected'));
    const app = await initApp();

    // Wrap Express in an HTTP server so Socket.IO can share the same port
    const httpServer = http.createServer(app);

    // Initialize Socket.IO (connects own Redis pub/sub clients internally)
    await initSocketServer(httpServer);

    httpServer.listen(environment.backend.port, () =>
      logger.info(`✅ Listening on port ${environment.backend.port}`)
    );
  } catch (error) {
    logger.error('❌ Error starting server, error: ', error);
  }
};

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  logger.info('\n👋 Shutting down...');
  process.exit(0);
});

void startServer();
