import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { apiService } from '../services/apiService';

interface ExtractionJob {
  jobId: string;
  status: string;
  category: string;
  location: string;
  totalResults: number;
  processedResults: number;
  createdAt: string;
}

const ExtractionPage: React.FC = () => {
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [filters, setFilters] = useState({
    minRating: '',
    hasEmail: false,
    hasPhone: false,
    hasWebsite: false,
  });
  const [loading, setLoading] = useState(false);
  const [currentJob, setCurrentJob] = useState<ExtractionJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const categories = [
    'Restaurants', 'Hotels', 'Gas Stations', 'Pharmacies', 'Hospitals',
    'Schools', 'Banks', 'Grocery Stores', 'Shopping Centers', 'Gyms',
    'Dentists', 'Lawyers', 'Real Estate', 'Auto Repair', 'Beauty Salons',
    'Pet Stores', 'Veterinarians', 'Insurance', 'Travel Agencies', 'Car Dealers'
  ];

  const handleStartExtraction = async () => {
    if (!category || !location) {
      setError('Please select a category and enter a location');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.startExtraction({
        category,
        location,
        filters: {
          minRating: filters.minRating ? parseFloat(filters.minRating) : undefined,
          hasEmail: filters.hasEmail,
          hasPhone: filters.hasPhone,
          hasWebsite: filters.hasWebsite,
        },
      });

      setCurrentJob({
        jobId: response.jobId,
        status: response.status,
        category,
        location,
        totalResults: 0,
        processedResults: 0,
        createdAt: new Date().toISOString(),
      });

      setSuccess('Extraction started successfully!');
      
      // Poll for job status
      pollJobStatus(response.jobId);
    } catch (error: any) {
      setError(error.message || 'Failed to start extraction');
    } finally {
      setLoading(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await apiService.getJobStatus(jobId);
        setCurrentJob(prev => prev ? { ...prev, ...status } : null);

        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
          if (status.status === 'completed') {
            setSuccess(`Extraction completed! Found ${status.totalResults} businesses.`);
          } else {
            setError('Extraction failed. Please try again.');
          }
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        clearInterval(interval);
      }
    }, 2000);
  };

  const handleCancelJob = async () => {
    if (!currentJob) return;

    try {
      await apiService.cancelJob(currentJob.jobId);
      setCurrentJob(null);
      setSuccess('Job cancelled successfully');
    } catch (error: any) {
      setError(error.message || 'Failed to cancel job');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'primary';
      case 'failed': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Extract Data
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Extract business data from Google Maps by category and location
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Extraction Settings
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    label="Category"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., New York, NY or 10001"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Filters
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Minimum Rating"
                      type="number"
                      value={filters.minRating}
                      onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                      inputProps={{ min: 0, max: 5, step: 0.1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filters.hasEmail}
                            onChange={(e) => setFilters({ ...filters, hasEmail: e.target.checked })}
                          />
                        }
                        label="Has Email"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filters.hasPhone}
                            onChange={(e) => setFilters({ ...filters, hasPhone: e.target.checked })}
                          />
                        }
                        label="Has Phone"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={filters.hasWebsite}
                            onChange={(e) => setFilters({ ...filters, hasWebsite: e.target.checked })}
                          />
                        }
                        label="Has Website"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <PlayIcon />}
                    onClick={handleStartExtraction}
                    disabled={loading || !category || !location}
                  >
                    {loading ? 'Starting...' : 'Start Extraction'}
                  </Button>
                  
                  {currentJob && currentJob.status === 'running' && (
                    <Button
                      variant="outlined"
                      startIcon={<StopIcon />}
                      onClick={handleCancelJob}
                      color="error"
                    >
                      Cancel Job
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          {currentJob && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Job
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body1">{currentJob.category}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1">{currentJob.location}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={currentJob.status}
                      color={getStatusColor(currentJob.status) as any}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="body1">
                      {currentJob.processedResults} / {currentJob.totalResults || '?'} businesses
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ExtractionPage;
