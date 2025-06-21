const Joi = require('joi');

const createJobSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  estimatedHours: Joi.number().positive().allow(null),
  customerJobId: Joi.string().optional()
});

module.exports = { createJobSchema };