import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { apiService } from '../services/apiService';

interface AnalyticsData {
  total_extractions: number;
  total_jobs: number;
  completed_jobs: number;
  pending_jobs: number;
  avg_rating: number;
  businesses_with_email: number;
  businesses_with_phone: number;
  businesses_with_website: number;
}

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const stats = await apiService.getStats();
      setData(stats);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">No data available</Alert>
      </Container>
    );
  }

  const dataQualityData = [
    { name: 'With Email', value: data.businesses_with_email, color: '#1976d2' },
    { name: 'With Phone', value: data.businesses_with_phone, color: '#2e7d32' },
    { name: 'With Website', value: data.businesses_with_website, color: '#ed6c02' },
  ];

  const jobStatusData = [
    { name: 'Completed', value: data.completed_jobs, color: '#2e7d32' },
    { name: 'Pending', value: data.pending_jobs, color: '#ed6c02' },
  ];

  const extractionTrendData = [
    { name: 'Total Extractions', value: data.total_extractions },
    { name: 'Completed Jobs', value: data.completed_jobs },
    { name: 'Pending Jobs', value: data.pending_jobs },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Insights and statistics from your data extractions
      </Typography>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Extractions
              </Typography>
              <Typography variant="h3" color="primary">
                {data.total_extractions.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Completed Jobs
              </Typography>
              <Typography variant="h3" color="success.main">
                {data.completed_jobs}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Jobs
              </Typography>
              <Typography variant="h3" color="warning.main">
                {data.pending_jobs}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Rating
              </Typography>
              <Typography variant="h3" color="secondary.main">
                {data.avg_rating ? data.avg_rating.toFixed(1) : '0.0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Quality Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Quality Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dataQualityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dataQualityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Job Status Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={jobStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Extraction Overview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Extraction Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={extractionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Quality Metrics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Quality Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {data.businesses_with_email.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Businesses with Email
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {data.businesses_with_phone.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Businesses with Phone
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {data.businesses_with_website.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Businesses with Website
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
