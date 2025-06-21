const express = require('express');
const router = express.Router();

// Import other route modules here
const jobRoute = require('./job.route');

// Route registrations
router.use('/jobs', jobRoute);

// Health check or base path
router.get('/health-check', (req, res) => {
  res.send('Service is running');
});

module.exports = router;
