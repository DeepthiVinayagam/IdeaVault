const path = require('path');
const dotenv = require('dotenv');

// Load .env from server directory or project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'ideavault_jwt_secret_dev_key_2026',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'ideavault_cookie_secret_dev_2026',
  DB_PATH: process.env.DB_PATH 
    ? path.resolve(__dirname, '..', process.env.DB_PATH) 
    : path.resolve(__dirname, '../ideaVault.db'),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173'
};
