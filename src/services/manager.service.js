const prisma = require('./prisma.service');
const rabbitMQService = require('./rabbitmq.service');

class ManagerService {
  async start() {
    await rabbitMQService.consumeFromQueue('manager_jobs', this.processJob.bind(this));
  }

  async processJob(job) {
    // Create task in database
    await prisma.task.create({
      data: {
        title: job.title,
        description: job.description,
        status: job.status,
        priority: job.priority,
        estimatedHours: job.estimatedHours,
        customerJobId: job.customerJobId,
        assignedTo: { connect: { id: job.assignedTo } },
        createdBy: { connect: { role: 'CHIEF' } }
      }
    });

    // Update manager's task count
    await prisma.user.update({
      where: { id: job.assignedTo },
      data: { currentTasks: { increment: 1 } }
    });

    // Notify manager
    await prisma.notification.create({
      data: {
        message: `New job assigned: ${job.title}`,
        type: 'NEW_TASK',
        user: { connect: { id: job.assignedTo } }
      }
    });
  }
}

module.exports = new ManagerService();