const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/init');
const { GoogleMapsScraper } = require('../services/googleMapsScraper');

const db = getDatabase();

// Start a new extraction job
router.post('/start', async (req, res) => {
  try {
    console.log('Extraction request received:', req.body);
    const { category, location, filters = {} } = req.body;

    if (!category || !location) {
      console.log('Missing required fields:', { category, location });
      return res.status(400).json({ 
        error: 'Category and location are required' 
      });
    }

    const jobId = uuidv4();
    const scraper = new GoogleMapsScraper();

    // Save job to database
    db.run(
      `INSERT INTO extraction_jobs (job_id, category, location, filters, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [jobId, category, location, JSON.stringify(filters), 'pending'],
      function(err) {
        if (err) {
          console.error('Error saving job:', err);
          return res.status(500).json({ error: 'Failed to create extraction job' });
        }

        // Start scraping in background with timeout
        const scrapingPromise = scraper.scrapeData(jobId, category, location, filters);
        
        // Set a timeout for the scraping operation
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Scraping timeout')), 45000); // 45 seconds
        });

        Promise.race([scrapingPromise, timeoutPromise])
          .catch(error => {
            console.error('Scraping error:', error);
            // Update job status to failed
            db.run(
              'UPDATE extraction_jobs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?',
              ['failed', jobId]
            );
          });

        res.json({ 
          jobId, 
          status: 'started',
          message: 'Extraction job started successfully' 
        });
      }
    );
  } catch (error) {
    console.error('Error starting extraction:', error);
    res.status(500).json({ error: 'Failed to start extraction: ' + error.message });
  }
});

// Get job status
router.get('/status/:jobId', (req, res) => {
  const { jobId } = req.params;

  db.get(
    'SELECT * FROM extraction_jobs WHERE job_id = ?',
    [jobId],
    (err, row) => {
      if (err) {
        console.error('Error fetching job status:', err);
        return res.status(500).json({ error: 'Failed to fetch job status' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json({
        jobId: row.job_id,
        category: row.category,
        location: row.location,
        filters: JSON.parse(row.filters || '{}'),
        status: row.status,
        totalResults: row.total_results,
        processedResults: row.processed_results,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      });
    }
  );
});

// Get all jobs
router.get('/jobs', (req, res) => {
  const { limit = 50, offset = 0 } = req.query;

  db.all(
    `SELECT * FROM extraction_jobs 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [parseInt(limit), parseInt(offset)],
    (err, rows) => {
      if (err) {
        console.error('Error fetching jobs:', err);
        return res.status(500).json({ error: 'Failed to fetch jobs' });
      }

      const jobs = rows.map(row => ({
        jobId: row.job_id,
        category: row.category,
        location: row.location,
        filters: JSON.parse(row.filters || '{}'),
        status: row.status,
        totalResults: row.total_results,
        processedResults: row.processed_results,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      res.json({ jobs });
    }
  );
});

// Cancel a job
router.post('/cancel/:jobId', (req, res) => {
  const { jobId } = req.params;

  db.run(
    'UPDATE extraction_jobs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE job_id = ?',
    ['cancelled', jobId],
    function(err) {
      if (err) {
        console.error('Error cancelling job:', err);
        return res.status(500).json({ error: 'Failed to cancel job' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json({ message: 'Job cancelled successfully' });
    }
  );
});

module.exports = router;
