import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ExtractionPage from './pages/ExtractionPage';
import DataViewer from './pages/DataViewer';
import Analytics from './pages/Analytics';

function App() {
  return (
    <ErrorBoundary>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, pt: 8 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/extract" element={<ExtractionPage />} />
            <Route path="/data" element={<DataViewer />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </Box>
      </Box>
    </ErrorBoundary>
  );
}

export default App;
