'use strict';
const app    = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const { pool } = require('./db/pool');

const server = app.listen(config.port, () => {
  logger.info(`🏥 Cinick API server running on port ${config.port} [${config.env}]`);
  logger.info(`📖 Swagger docs: http://localhost:${config.port}/api-docs`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    await pool.end();
    logger.info('Database pool closed');
    process.exit(0);
  });
  setTimeout(() => { logger.error('Forced shutdown'); process.exit(1); }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});
