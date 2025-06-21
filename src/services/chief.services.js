const prisma = require('./prisma.service');
const rabbitMQService = require('./rabbitmq.service');

class ChiefService {
  async start() {
    await rabbitMQService.consumeFromQueue('unassigned_jobs', this.processJob.bind(this));
  }

  async processJob(job) {
    try {
      // Find available manager with least workload
      const manager = await prisma.user.findFirst({
        where: { role: 'MANAGER' },
        orderBy: { currentTasks: 'asc' },
        select: { id: true }
      });

      if (!manager) {
        throw new Error('No available managers');
      }

      // Forward to manager queue
      await rabbitMQService.publishToQueue('manager_jobs', {
        ...job,
        assignedTo: manager.id,
        status: 'PENDING'
      });

      // Create notification for chief
      await prisma.notification.create({
        data: {
          message: `New job assigned to manager: ${job.title}`,
          type: 'JOB_ASSIGNMENT',
          user: { connect: { role: 'CHIEF' } }
        }
      });
    } catch (error) {
      // Retry or move to dead letter queue
      await rabbitMQService.publishToQueue('unassigned_jobs_dlq', job);
    }
  }
}

module.exports = new ChiefService();