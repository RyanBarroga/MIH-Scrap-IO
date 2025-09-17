const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { exportToCSV, exportToExcel } = require('../services/exportService');

const db = getDatabase();

// Get extracted data for a job
router.get('/job/:jobId', (req, res) => {
  const { jobId } = req.params;
  const { limit = 1000, offset = 0 } = req.query;

  db.all(
    `SELECT * FROM extracted_data 
     WHERE job_id = ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [jobId, parseInt(limit), parseInt(offset)],
    (err, rows) => {
      if (err) {
        console.error('Error fetching data:', err);
        return res.status(500).json({ error: 'Failed to fetch data' });
      }

      const data = rows.map(row => ({
        id: row.id,
        businessName: row.business_name,
        address: row.address,
        phone: row.phone,
        email: row.email,
        website: row.website,
        rating: row.rating,
        reviewCount: row.review_count,
        category: row.category,
        latitude: row.latitude,
        longitude: row.longitude,
        placeId: row.place_id,
        createdAt: row.created_at
      }));

      res.json({ data, total: rows.length });
    }
  );
});

// Get all extracted data with filters
router.get('/all', (req, res) => {
  const { 
    category, 
    location, 
    minRating, 
    hasEmail, 
    hasPhone, 
    hasWebsite,
    limit = 1000, 
    offset = 0 
  } = req.query;

  let query = 'SELECT * FROM extracted_data WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category LIKE ?';
    params.push(`%${category}%`);
  }

  if (minRating) {
    query += ' AND rating >= ?';
    params.push(parseFloat(minRating));
  }

  if (hasEmail === 'true') {
    query += ' AND email IS NOT NULL AND email != ""';
  }

  if (hasPhone === 'true') {
    query += ' AND phone IS NOT NULL AND phone != ""';
  }

  if (hasWebsite === 'true') {
    query += ' AND website IS NOT NULL AND website != ""';
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).json({ error: 'Failed to fetch data' });
    }

    const data = rows.map(row => ({
      id: row.id,
      businessName: row.business_name,
      address: row.address,
      phone: row.phone,
      email: row.email,
      website: row.website,
      rating: row.rating,
      reviewCount: row.review_count,
      category: row.category,
      latitude: row.latitude,
      longitude: row.longitude,
      placeId: row.place_id,
      createdAt: row.created_at
    }));

    res.json({ data, total: rows.length });
  });
});

// Export data to CSV
router.get('/export/csv/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { filename = `scrapio_export_${jobId}.csv` } = req.query;

    // Get data for the job
    db.all(
      'SELECT * FROM extracted_data WHERE job_id = ?',
      [jobId],
      async (err, rows) => {
        if (err) {
          console.error('Error fetching data for export:', err);
          return res.status(500).json({ error: 'Failed to fetch data for export' });
        }

        if (rows.length === 0) {
          return res.status(404).json({ error: 'No data found for this job' });
        }

        const csvBuffer = await exportToCSV(rows);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csvBuffer);
      }
    );
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// Export data to Excel
router.get('/export/excel/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { filename = `scrapio_export_${jobId}.xlsx` } = req.query;

    // Get data for the job
    db.all(
      'SELECT * FROM extracted_data WHERE job_id = ?',
      [jobId],
      async (err, rows) => {
        if (err) {
          console.error('Error fetching data for export:', err);
          return res.status(500).json({ error: 'Failed to fetch data for export' });
        }

        if (rows.length === 0) {
          return res.status(404).json({ error: 'No data found for this job' });
        }

        const excelBuffer = await exportToExcel(rows);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(excelBuffer);
      }
    );
  } catch (error) {
    console.error('Error exporting Excel:', error);
    res.status(500).json({ error: 'Failed to export Excel' });
  }
});

// Get statistics
router.get('/stats', (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total_extractions FROM extracted_data',
    'SELECT COUNT(*) as total_jobs FROM extraction_jobs',
    'SELECT COUNT(*) as completed_jobs FROM extraction_jobs WHERE status = "completed"',
    'SELECT COUNT(*) as pending_jobs FROM extraction_jobs WHERE status = "pending"',
    'SELECT AVG(rating) as avg_rating FROM extracted_data WHERE rating IS NOT NULL',
    'SELECT COUNT(*) as businesses_with_email FROM extracted_data WHERE email IS NOT NULL AND email != ""',
    'SELECT COUNT(*) as businesses_with_phone FROM extracted_data WHERE phone IS NOT NULL AND phone != ""',
    'SELECT COUNT(*) as businesses_with_website FROM extracted_data WHERE website IS NOT NULL AND website != ""'
  ];

  const stats = {};
  let completedQueries = 0;

  queries.forEach((query, index) => {
    db.get(query, (err, row) => {
      if (err) {
        console.error('Error fetching stats:', err);
        return res.status(500).json({ error: 'Failed to fetch statistics' });
      }

      const key = Object.keys(row)[0];
      stats[key] = row[key];

      completedQueries++;
      if (completedQueries === queries.length) {
        res.json(stats);
      }
    });
  });
});

module.exports = router;
