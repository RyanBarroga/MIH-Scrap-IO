const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_URL || './data/scrapio.db';

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create extraction_jobs table
      db.run(`
        CREATE TABLE IF NOT EXISTS extraction_jobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_id TEXT UNIQUE NOT NULL,
          category TEXT NOT NULL,
          location TEXT NOT NULL,
          filters TEXT,
          status TEXT DEFAULT 'pending',
          total_results INTEGER DEFAULT 0,
          processed_results INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create extracted_data table
      db.run(`
        CREATE TABLE IF NOT EXISTS extracted_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_id TEXT NOT NULL,
          business_name TEXT,
          address TEXT,
          phone TEXT,
          email TEXT,
          website TEXT,
          rating REAL,
          review_count INTEGER,
          category TEXT,
          latitude REAL,
          longitude REAL,
          place_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (job_id) REFERENCES extraction_jobs (job_id)
        )
      `);

      // Create categories table
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          google_maps_category TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert default categories
      const defaultCategories = [
        'Restaurants', 'Hotels', 'Gas Stations', 'Pharmacies', 'Hospitals',
        'Schools', 'Banks', 'Grocery Stores', 'Shopping Centers', 'Gyms',
        'Dentists', 'Lawyers', 'Real Estate', 'Auto Repair', 'Beauty Salons',
        'Pet Stores', 'Veterinarians', 'Insurance', 'Travel Agencies', 'Car Dealers'
      ];

      const stmt = db.prepare(`
        INSERT OR IGNORE INTO categories (name, google_maps_category) 
        VALUES (?, ?)
      `);

      defaultCategories.forEach(category => {
        stmt.run(category, category.toLowerCase().replace(/\s+/g, '_'));
      });

      stmt.finalize((err) => {
        if (err) {
          console.error('Error inserting default categories:', err);
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
  });
}

function getDatabase() {
  return db;
}

module.exports = {
  initializeDatabase,
  getDatabase
};
