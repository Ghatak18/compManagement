const http = require('http');
const app = require('./app');
const prisma = require('./services/prisma.service');
const rabbitMQService = require('./services/rabbitmq.service');
const chiefService = require('./services/chief.services.js');
const managerService = require('./services/manager.service');
const logger = require('./config/logger');

const server = http.createServer(app);

async function start() {
  // Connect to database
  await prisma.$connect();
  logger.info('Connected to PostgreSQL database');

  // Connect to RabbitMQ
  await rabbitMQService.connect();
  
  // Start consumers
  await chiefService.start();
  await managerService.start();

  // Start server
  server.listen(process.env.PORT || 3000, () => {
    logger.info(`Server running on port ${process.env.PORT || 3000}`);
  });
}

start();

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  server.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);