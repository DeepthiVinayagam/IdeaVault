const app = require('./app');
const config = require('./config');

const server = app.listen(config.PORT, () => {
  console.log(`🚀 IdeaVault Backend running on http://localhost:${config.PORT}`);
  console.log(`📡 Environment: ${config.NODE_ENV}`);
  console.log(`💾 Database file: ${config.DB_PATH}`);
});

module.exports = server;
