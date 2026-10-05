require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const apiRoutes = require('./routes/index');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allows development and Vercel preview URLs
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Mount API routes
app.use('/api', apiRoutes);

// Root greeting / info
app.get('/', (req, res) => {
  res.json({
    name: 'DriveEase Vehicle Rental System API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      vehicles: '/api/vehicles',
      auth: '/api/auth'
    }
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
