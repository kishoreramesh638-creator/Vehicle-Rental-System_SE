require('dotenv').config();
const app = require('./app');
const { initDB, getDriver } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initDB();
    console.log(`🚀 Database engine ready [Driver: ${getDriver()}].`);

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚗 DriveEase Vehicle Rental Backend Server running!`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
};

startServer();
