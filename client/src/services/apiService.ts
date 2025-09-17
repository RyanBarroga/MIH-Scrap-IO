import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const apiService = {
  // Extraction endpoints
  startExtraction: async (data: {
    category: string;
    location: string;
    filters: {
      minRating?: number;
      hasEmail?: boolean;
      hasPhone?: boolean;
      hasWebsite?: boolean;
    };
  }) => {
    const response = await api.post('/scraping/start', data);
    return response.data;
  },

  getJobStatus: async (jobId: string) => {
    const response = await api.get(`/scraping/status/${jobId}`);
    return response.data;
  },

  getJobs: async (limit = 50, offset = 0) => {
    const response = await api.get(`/scraping/jobs?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  cancelJob: async (jobId: string) => {
    const response = await api.post(`/scraping/cancel/${jobId}`);
    return response.data;
  },

  // Data endpoints
  getJobData: async (jobId: string, limit = 1000, offset = 0) => {
    const response = await api.get(`/data/job/${jobId}?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getAllData: async (filters: {
    category?: string;
    location?: string;
    minRating?: number;
    hasEmail?: boolean;
    hasPhone?: boolean;
    hasWebsite?: boolean;
    limit?: number;
    offset?: number;
  } = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/data/all?${params.toString()}`);
    return response.data;
  },

  exportCSV: async (jobId: string, filename?: string) => {
    const response = await api.get(`/data/export/csv/${jobId}?filename=${filename || `scrapio_export_${jobId}.csv`}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportExcel: async (jobId: string, filename?: string) => {
    const response = await api.get(`/data/export/excel/${jobId}?filename=${filename || `scrapio_export_${jobId}.xlsx`}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/data/stats');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};
