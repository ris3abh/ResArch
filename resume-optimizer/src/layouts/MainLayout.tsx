// src/layouts/MainLayout.tsx
import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      {children}
    </Box>
  );
};

export default MainLayout;