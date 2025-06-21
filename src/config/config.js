require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

const development = {
  env,
  port: process.env.PORT || 3000,
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
};

const production = {
  env,
  port: process.env.PORT || 3000,
  logs: 'combined',
};

const test = {
  env,
  port: process.env.PORT || 3000,
  logs: 'dev',
};

const config = {
  development,
  production,
  test,
};

module.exports = config[env];