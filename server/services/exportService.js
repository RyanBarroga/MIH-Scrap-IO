const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const XLSX = require('xlsx');

async function exportToCSV(data) {
  return new Promise((resolve, reject) => {
    const csvWriter = createCsvWriter({
      path: 'temp_export.csv',
      header: [
        { id: 'business_name', title: 'Business Name' },
        { id: 'address', title: 'Address' },
        { id: 'phone', title: 'Phone' },
        { id: 'email', title: 'Email' },
        { id: 'website', title: 'Website' },
        { id: 'rating', title: 'Rating' },
        { id: 'review_count', title: 'Review Count' },
        { id: 'category', title: 'Category' },
        { id: 'latitude', title: 'Latitude' },
        { id: 'longitude', title: 'Longitude' },
        { id: 'place_id', title: 'Place ID' },
        { id: 'created_at', title: 'Created At' }
      ]
    });

    // Transform data for CSV
    const csvData = data.map(row => ({
      business_name: row.business_name || '',
      address: row.address || '',
      phone: row.phone || '',
      email: row.email || '',
      website: row.website || '',
      rating: row.rating || '',
      review_count: row.review_count || '',
      category: row.category || '',
      latitude: row.latitude || '',
      longitude: row.longitude || '',
      place_id: row.place_id || '',
      created_at: row.created_at || ''
    }));

    csvWriter.writeRecords(csvData)
      .then(() => {
        const fs = require('fs');
        const csvBuffer = fs.readFileSync('temp_export.csv');
        fs.unlinkSync('temp_export.csv'); // Clean up temp file
        resolve(csvBuffer);
      })
      .catch(reject);
  });
}

async function exportToExcel(data) {
  return new Promise((resolve, reject) => {
    try {
      // Transform data for Excel
      const excelData = data.map(row => ({
        'Business Name': row.business_name || '',
        'Address': row.address || '',
        'Phone': row.phone || '',
        'Email': row.email || '',
        'Website': row.website || '',
        'Rating': row.rating || '',
        'Review Count': row.review_count || '',
        'Category': row.category || '',
        'Latitude': row.latitude || '',
        'Longitude': row.longitude || '',
        'Place ID': row.place_id || '',
        'Created At': row.created_at || ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      const colWidths = [
        { wch: 30 }, // Business Name
        { wch: 40 }, // Address
        { wch: 20 }, // Phone
        { wch: 30 }, // Email
        { wch: 40 }, // Website
        { wch: 10 }, // Rating
        { wch: 15 }, // Review Count
        { wch: 20 }, // Category
        { wch: 15 }, // Latitude
        { wch: 15 }, // Longitude
        { wch: 30 }, // Place ID
        { wch: 20 }  // Created At
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data');
      
      // Generate buffer
      const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      resolve(excelBuffer);
      
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  exportToCSV,
  exportToExcel
};
