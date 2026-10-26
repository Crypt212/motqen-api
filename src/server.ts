import http from 'http';
import initApp from './app.js';
import environment from './configs/environment.js';
import prismaClient from './libs/database.js';
import redisClient from './libs/redis.js';
import { logger } from './libs/winston.js';
import { initSocketServer } from './socket/socketManager.js';
import { connectWhatsApp } from './providers/whatsapp.js';
import { notificationWorker } from './workers/notifications.worker.js';
import { notificationQueue, cronQueue } from './queue/queue.js';
import { cronWorker } from './workers/cron.worker.js';
import { registerCronJobs } from './cron/scheduler.js';

const startServer = async () => {
  try {
    await redisClient.connect();
    await prismaClient.$connect().then(() => logger.info('✅ Database connected'));
    const app = await initApp();

    // Wrap Express in an HTTP server so Socket.IO can share the same port
    const httpServer = http.createServer(app);

    // Initialize Socket.IO (connects own Redis pub/sub clients internally)
    await initSocketServer(httpServer);

    // Start the BullMQ notification worker in-process (no separate process yet)
    logger.info('✅ Notification worker started');

    // Cron housekeeping moved to BullMQ job schedulers (replaces setInterval crons)
    await registerCronJobs().catch((error) => {
      logger.error('❌ Failed to register cron job schedulers', error);
    });
    logger.info('✅ Cron worker started');

    // await connectWhatsApp();
    httpServer.listen(environment.backend.port, () =>
      logger.info(`✅ Listening on port ${environment.backend.port}`)
    );
  } catch (error) {
    logger.error('❌ Error starting server, error: ', error);
  }
};

let shuttingDown = false;

const shutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info(`\n👋 Shutting down (${signal})...`);
  try {
    // Stop the workers first so they stop claiming new jobs, then close the queues.
    await cronWorker.close();
    await notificationWorker.close();
    await notificationQueue.close();
    await cronQueue.close();
  } catch (error) {
    logger.error('❌ Error during shutdown', error);
  }
  process.exit(0);
};

// Handle Ctrl+C / SIGTERM gracefully
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

void startServer();
