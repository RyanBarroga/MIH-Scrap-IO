const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const scrapingRoutes = require('./routes/scraping');
const dataRoutes = require('./routes/data');
const { initializeDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/scraping', scrapingRoutes);
app.use('/api/data', dataRoutes);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel: process.env.VERCEL || false,
    database: process.env.VERCEL ? 'in-memory' : 'file-based'
  });
});

// Test endpoint for debugging
app.post('/api/test', (req, res) => {
  console.log('Test endpoint hit:', req.body);
  res.json({ message: 'Test successful', received: req.body });
});

// Simple test endpoint for extraction
app.post('/api/test-extraction', (req, res) => {
  try {
    const { category, location } = req.body;
    console.log('Test extraction request:', { category, location });
    
    // Simulate a quick extraction
    setTimeout(() => {
      res.json({ 
        jobId: 'test-' + Date.now(),
        status: 'completed',
        message: 'Test extraction completed',
        data: [
          {
            businessName: `Test ${category} Business`,
            address: `123 Test St, ${location}`,
            phone: '(555) 123-4567',
            email: 'test@example.com',
            website: 'https://example.com',
            rating: 4.5,
            category: category
          }
        ]
      });
    }, 1000);
  } catch (error) {
    console.error('Test extraction error:', error);
    res.status(500).json({ error: 'Test extraction failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
