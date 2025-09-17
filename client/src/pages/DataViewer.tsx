import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { apiService } from '../services/apiService';

interface BusinessData {
  id: number;
  businessName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  rating: number;
  reviewCount: number;
  category: string;
  latitude: number;
  longitude: number;
  placeId: string;
  createdAt: string;
}

const DataViewer: React.FC = () => {
  const [data, setData] = useState<BusinessData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    category: '',
    minRating: '',
    hasEmail: false,
    hasPhone: false,
    hasWebsite: false,
  });

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAllData({
        ...filters,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      });
      setData(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      // For now, export all data (you might want to implement job-specific export)
      const response = await apiService.getAllData({ limit: 10000 });
      const exportData = response.data;
      
      if (format === 'csv') {
        const csvContent = convertToCSV(exportData);
        downloadFile(csvContent, 'scrapio_data.csv', 'text/csv');
      } else {
        // For Excel, you'd need to implement a similar function
        console.log('Excel export not implemented yet');
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const convertToCSV = (data: BusinessData[]) => {
    const headers = [
      'Business Name', 'Address', 'Phone', 'Email', 'Website',
      'Rating', 'Review Count', 'Category', 'Latitude', 'Longitude', 'Created At'
    ];
    
    const csvRows = [
      headers.join(','),
      ...data.map(row => [
        `"${row.businessName || ''}"`,
        `"${row.address || ''}"`,
        `"${row.phone || ''}"`,
        `"${row.email || ''}"`,
        `"${row.website || ''}"`,
        row.rating || '',
        row.reviewCount || '',
        `"${row.category || ''}"`,
        row.latitude || '',
        row.longitude || '',
        `"${row.createdAt || ''}"`
      ].join(','))
    ];
    
    return csvRows.join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Extracted Data
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('csv')}
            sx={{ mr: 1 }}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Filters
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            label="Category"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Min Rating"
            type="number"
            value={filters.minRating}
            onChange={(e) => handleFilterChange('minRating', e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
            inputProps={{ min: 0, max: 5, step: 0.1 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.hasEmail}
                onChange={(e) => handleFilterChange('hasEmail', e.target.checked)}
              />
            }
            label="Has Email"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.hasPhone}
                onChange={(e) => handleFilterChange('hasPhone', e.target.checked)}
              />
            }
            label="Has Phone"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.hasWebsite}
                onChange={(e) => handleFilterChange('hasWebsite', e.target.checked)}
              />
            }
            label="Has Website"
          />
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Business Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Website</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Reviews</TableCell>
              <TableCell>Category</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {row.businessName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {row.address}
                  </Typography>
                </TableCell>
                <TableCell>
                  {row.phone ? (
                    <Chip label={row.phone} size="small" color="primary" />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {row.email ? (
                    <Chip label={row.email} size="small" color="success" />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {row.website ? (
                    <Button
                      size="small"
                      href={row.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {row.rating ? (
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {row.rating.toFixed(1)}
                      </Typography>
                      <Chip
                        label={`${row.rating.toFixed(1)}★`}
                        size="small"
                        color={row.rating >= 4 ? 'success' : row.rating >= 3 ? 'warning' : 'error'}
                      />
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {row.reviewCount ? (
                    <Typography variant="body2">
                      {row.reviewCount.toLocaleString()}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip label={row.category} size="small" variant="outlined" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Container>
  );
};

export default DataViewer;
