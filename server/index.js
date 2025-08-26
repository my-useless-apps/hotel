require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Import routes (these will be created)
// const authRoutes = require('./routes/auth');
// const publicRoutes = require('./routes/public');
// const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'https://your-app-name.vercel.app', // Replace with your actual Vercel URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Premium Stays API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      test: '/api/test'
    },
    documentation: 'Visit /api/test for API features'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Premium Stays API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes (uncomment when route files are created)
// app.use('/api/auth', authRoutes);
// app.use('/api', publicRoutes);
// app.use('/admin/api', adminRoutes);

// Placeholder route for testing
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Premium Stays Hotel API is working!',
    features: [
      'House activation/deactivation system',
      'Real-time availability calendar',
      'Admin dashboard with toggle controls',
      'JWT authentication',
      'PostgreSQL database'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Premium Stays server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
  }
});

module.exports = app;

