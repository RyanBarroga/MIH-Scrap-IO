# ScrapIO - Google Maps Data Extraction Tool

A standalone web application that extracts business data from Google Maps, similar to scrap.io. Built with React frontend and Node.js/Express backend.

## Features

- **Google Maps Data Extraction**: Extract business listings by category and location
- **Advanced Filtering**: Filter by rating, email availability, phone, website, etc.
- **Real-time Processing**: Live job status updates and progress tracking
- **Data Export**: Export extracted data to CSV and Excel formats
- **Analytics Dashboard**: View statistics and data quality metrics
- **Modern UI**: Clean, responsive interface built with Material-UI
- **RESTful API**: Programmatic access to all features

## Tech Stack

### Frontend
- React 18 with TypeScript
- Material-UI (MUI) for components
- React Router for navigation
- Recharts for analytics
- Axios for API calls

### Backend
- Node.js with Express
- SQLite database
- Puppeteer for web scraping
- CSV/Excel export capabilities
- Rate limiting and security middleware

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd scrapio
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment file
   cp env.example .env
   
   # Edit .env file with your settings
   PORT=5000
   NODE_ENV=development
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   DATABASE_URL=./data/scrapio.db
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

## Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   npm run server
   ```

2. **Start the frontend (in a new terminal)**
   ```bash
   npm run client
   ```

3. **Or run both simultaneously**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Mode

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## Usage

### 1. Dashboard
- View extraction statistics and data quality metrics
- Quick access to start new extractions
- Monitor job status and progress

### 2. Extract Data
- Select a business category from the dropdown
- Enter a location (city, state, or ZIP code)
- Apply filters (minimum rating, contact info requirements)
- Start the extraction process
- Monitor real-time progress

### 3. View Data
- Browse extracted business data in a table format
- Apply filters to find specific businesses
- Export data to CSV or Excel formats
- View detailed business information

### 4. Analytics
- View data quality distribution charts
- Monitor extraction job statistics
- Track business contact information availability

## API Endpoints

### Extraction
- `POST /api/scraping/start` - Start a new extraction job
- `GET /api/scraping/status/:jobId` - Get job status
- `GET /api/scraping/jobs` - List all jobs
- `POST /api/scraping/cancel/:jobId` - Cancel a job

### Data
- `GET /api/data/job/:jobId` - Get data for a specific job
- `GET /api/data/all` - Get all extracted data with filters
- `GET /api/data/export/csv/:jobId` - Export job data as CSV
- `GET /api/data/export/excel/:jobId` - Export job data as Excel
- `GET /api/data/stats` - Get extraction statistics

### Health
- `GET /api/health` - Health check endpoint

## Configuration

### Environment Variables

- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `GOOGLE_MAPS_API_KEY`: Google Maps API key (optional, for enhanced features)
- `DATABASE_URL`: SQLite database file path
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window

### Database

The application uses SQLite for data storage. The database file is created automatically at startup in the `./data/` directory.

## Security Features

- Rate limiting to prevent abuse
- CORS protection
- Helmet.js security headers
- Input validation and sanitization
- Error handling and logging

## Legal Compliance

- Only extracts publicly available data
- Respects robots.txt and rate limits
- GDPR compliant data handling
- Professional use only

## Troubleshooting

### Common Issues

1. **Blank white page**: Make sure all dependencies are installed and the development server is running
2. **CORS errors**: Check that the backend server is running on port 5000
3. **Database errors**: Ensure the `./data/` directory exists and is writable
4. **Scraping failures**: Check your internet connection and try with different locations

### Development Tips

- Check browser console for JavaScript errors
- Monitor backend logs for API issues
- Use the health check endpoint to verify backend status
- Clear browser cache if experiencing UI issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue in the repository

---

**Note**: This tool is for professional use only. Always respect website terms of service and applicable laws when scraping data.
