const express = require('express');
const router = express.Router();
const rabbitMQService = require('../services/rabbitmq.service');
const  validate = require('../middlewares/validate');
const { createJobSchema } = require('../validation/job.validation.js');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const logger = require('../config/logger');

/**
 * @route POST /jobs
 * @desc Submit a new job for review
 * @access Public
 * @param {string} title.body.required - Job title
 * @param {string} description.body.required - Job description
 * @param {string} priority.body - Priority level (low/medium/high)
 * @param {number} estimatedHours.body - Estimated hours to complete
 * @param {string} customerJobId.body - Optional custom job ID
 * @returns {object} 202 - Job submission confirmation
 * @returns {Error}  400 - Validation error
 * @returns {Error}  500 - Server error
 */
router.post('/', 
  validate(createJobSchema), 
  async (req, res, next) => {
    try {
      const { title, description, priority, estimatedHours, customerJobId } = req.body;

      const job = {
        title,
        description,
        priority: priority || 'medium',
        estimatedHours: estimatedHours || null,
        customerId: req.user?.id || 'anonymous',
        customerJobId: customerJobId || generateJobId(),
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      logger.info(`Submitting job ${job.customerJobId} to queue`);
      
      await rabbitMQService.publishToQueue('unassigned_jobs', job);
      
      res.status(202).json({
        success: true,
        message: 'Job submitted for review',
        data: {
          jobId: job.customerJobId,
          timestamp: job.timestamp,
          priority: job.priority
        }
      });

    } catch (error) {
      logger.error(`Job submission failed: ${error.message}`);
      next(error);
    }
  }
);

/**
 * Generates a unique job ID
 * @returns {string} Generated job ID
 */
function generateJobId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 6);
  return `job-${timestamp}-${randomStr}`;
}

module.exports = router;