// src/App.tsx
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import TemplatesPage from './pages/Template';
import WorkProfile from './pages/WorkProfile'; // <-- import new page
import ProtectedRoute from './components/ProtectedRoutes';
import { Box } from '@mui/material';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            width: '100%',
          }}
        >
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              {/* Add the new WorkProfile route */}
              <Route
                path="/workprofile"
                element={
                  <ProtectedRoute>
                    <WorkProfile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </Box>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
