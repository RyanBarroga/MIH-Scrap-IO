import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  Business,
  Download,
  Search,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

interface DashboardStats {
  total_extractions: number;
  total_jobs: number;
  completed_jobs: number;
  pending_jobs: number;
  avg_rating: number;
  businesses_with_email: number;
  businesses_with_phone: number;
  businesses_with_website: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Extractions',
      value: stats?.total_extractions || 0,
      icon: <Business />,
      color: '#1976d2',
    },
    {
      title: 'Completed Jobs',
      value: stats?.completed_jobs || 0,
      icon: <TrendingUp />,
      color: '#2e7d32',
    },
    {
      title: 'Pending Jobs',
      value: stats?.pending_jobs || 0,
      icon: <Search />,
      color: '#ed6c02',
    },
    {
      title: 'Avg Rating',
      value: stats?.avg_rating ? stats.avg_rating.toFixed(1) : '0.0',
      icon: <TrendingUp />,
      color: '#9c27b0',
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome to ScrapIO - Your professional Google Maps data extraction tool
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    sx={{
                      backgroundColor: card.color,
                      color: 'white',
                      borderRadius: 1,
                      p: 1,
                      mr: 2,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="h6" component="div">
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Quality
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Businesses with Email</Typography>
                  <Chip
                    label={stats?.businesses_with_email || 0}
                    color="primary"
                    size="small"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Businesses with Phone</Typography>
                  <Chip
                    label={stats?.businesses_with_phone || 0}
                    color="primary"
                    size="small"
                  />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Businesses with Website</Typography>
                  <Chip
                    label={stats?.businesses_with_website || 0}
                    color="primary"
                    size="small"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={() => navigate('/extract')}
                  fullWidth
                >
                  Start New Extraction
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => navigate('/data')}
                  fullWidth
                >
                  View Extracted Data
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
