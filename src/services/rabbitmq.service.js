const amqp = require('amqplib');
const logger = require('../config/logger');

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();
    logger.info('Connected to RabbitMQ');
  }

  async publishToQueue(queue, data) {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), { persistent: true });
  }

  async consumeFromQueue(queue, callback) {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.consume(queue, async (msg) => {
      try {
        await callback(JSON.parse(msg.content.toString()));
        this.channel.ack(msg);
      } catch (error) {
        logger.error(`Error processing message from ${queue}:`, error);
        this.channel.nack(msg, false, false);
      }
    });
  }
}

module.exports = new RabbitMQService();