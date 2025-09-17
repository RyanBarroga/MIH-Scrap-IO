const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for Vercel
let jobs = [];
let extractedData = [];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel: process.env.VERCEL || false,
    database: 'in-memory'
  });
});

// Start extraction
app.post('/api/scraping/start', (req, res) => {
  try {
    const { category, location, filters = {} } = req.body;
    
    if (!category || !location) {
      return res.status(400).json({ 
        error: 'Category and location are required' 
      });
    }

    const jobId = uuidv4();
    const job = {
      jobId,
      category,
      location,
      filters,
      status: 'running',
      totalResults: 0,
      processedResults: 0,
      createdAt: new Date().toISOString()
    };

    jobs.push(job);

    // Simulate extraction with mock data
    setTimeout(() => {
      const mockData = generateMockData(category, location, 10);
      
      // Update job status
      const jobIndex = jobs.findIndex(j => j.jobId === jobId);
      if (jobIndex !== -1) {
        jobs[jobIndex].status = 'completed';
        jobs[jobIndex].totalResults = mockData.length;
        jobs[jobIndex].processedResults = mockData.length;
      }

      // Store extracted data
      extractedData.push(...mockData.map(item => ({
        ...item,
        jobId
      })));

      console.log(`Job ${jobId} completed with ${mockData.length} results`);
    }, 2000);

    res.json({ 
      jobId, 
      status: 'started',
      message: 'Extraction job started successfully' 
    });
  } catch (error) {
    console.error('Error starting extraction:', error);
    res.status(500).json({ error: 'Failed to start extraction: ' + error.message });
  }
});

// Get job status
app.get('/api/scraping/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.find(j => j.jobId === jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({
    jobId: job.jobId,
    category: job.category,
    location: job.location,
    filters: job.filters,
    status: job.status,
    totalResults: job.totalResults,
    processedResults: job.processedResults,
    createdAt: job.createdAt
  });
});

// Get all data
app.get('/api/data/all', (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  const limitedData = extractedData.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
  
  res.json({
    data: limitedData,
    total: extractedData.length,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

// Get stats
app.get('/api/data/stats', (req, res) => {
  const totalExtractions = jobs.length;
  const completedJobs = jobs.filter(j => j.status === 'completed').length;
  const pendingJobs = jobs.filter(j => j.status === 'running').length;
  const totalData = extractedData.length;

  res.json({
    totalExtractions,
    completedJobs,
    pendingJobs,
    totalData
  });
});

// Generate mock data
function generateMockData(category, location, count) {
  const businesses = [];
  
  const categoryData = {
    'Schools': ['Lincoln Elementary', 'Washington High', 'Roosevelt Middle'],
    'Restaurants': ['Downtown Restaurant', 'City Center Cafe', 'Main Street Diner'],
    'Hotels': ['Grand Hotel', 'City Center Inn', 'Downtown Suites'],
    'Hospitals': ['City General Hospital', 'Regional Medical Center', 'Community Hospital'],
    'Banks': ['First National Bank', 'City Credit Union', 'Community Bank'],
    'Pharmacies': ['City Pharmacy', 'Health Plus Pharmacy', 'Community Drug Store'],
    'Gas Stations': ['Shell Station', 'Exxon Mobil', 'BP Gas Station'],
    'Gyms': ['FitLife Gym', 'Power Fitness', 'Elite Training']
  };

  const names = categoryData[category] || [`${category} Business`];
  const addresses = [
    '123 Main St', '456 Oak Ave', '789 Pine Rd', '321 Elm St',
    '654 Maple Dr', '987 Cedar Ln', '147 Birch St', '258 Spruce Ave'
  ];
  
  const phoneNumbers = [
    '(555) 123-4567', '(555) 234-5678', '(555) 345-6789', '(555) 456-7890'
  ];

  for (let i = 0; i < count; i++) {
    const businessName = names[i % names.length] + ` ${i + 1}`;
    const businessNameClean = businessName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .substring(0, 15);
    
    businesses.push({
      businessName: businessName,
      address: `${addresses[i % addresses.length]}, ${location}`,
      phone: phoneNumbers[i % phoneNumbers.length],
      email: `contact@${businessNameClean}.com`,
      website: `https://${businessNameClean}.com`,
      rating: 3.5 + Math.random() * 1.5,
      reviewCount: Math.floor(Math.random() * 100) + 10,
      category: category,
      latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
      placeId: `mock_place_${i + 1}_${Date.now()}`
    });
  }
  
  return businesses;
}

// Error handling
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

module.exports = app;
