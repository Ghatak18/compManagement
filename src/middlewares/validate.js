const { ApiError } = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Validate request against Joi schema
 * @param {Joi.Schema} schema - Joi validation schema
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }

  // Replace req.body with validated data
  req.body = value;
  next();
};

module.exports = validate; // Single default export