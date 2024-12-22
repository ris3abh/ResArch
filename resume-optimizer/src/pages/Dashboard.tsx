import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { removeAuthToken } from '../utils/auth';
import LoadingScreen from '../components/common/LoadingProgress';
import ErrorScreen from '../components/common/ErrorAlert';
import ResumeSection from '../components/dashboard/ResumeSection';
import SkillsSection from '../components/dashboard/SkillsSection';
import { Box, Typography, useTheme } from '@mui/material';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getCurrentUser();

      if (response.status === 401) {
        removeAuthToken();
        navigate('/');
        return;
      }

      if (response.data) {
        setUserData(response.data);
      } else {
        setError('Failed to fetch user data.');
      }
    } catch (err) {
      setError('An error occurred while fetching user data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={fetchUserData} />;

  const myTabs = [
    { title: 'Hard Skills', content: 'Skills like project management, data analysis, and problem-solving.' },
    { title: 'Soft Skills', content: 'Skills like communication, teamwork, leadership, and adaptability.' },
    { title: 'Technical Skills', content: 'Skills like Python, JavaScript, TensorFlow, and SQL.' },
  ];  

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* Header Message */}
      <Box
        sx={{
          textAlign: 'center',
          padding: '20px 0',
          bgcolor: '#FFFFFF',
          color: theme.palette.deepPurple.main,
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Resume Parsing & Skill Enhancement
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.85 }}>
          For the best experience with this application, we recommend spending at least 10 minutes on this page. This is a one-time activity.
        </Typography>
      </Box>

      {/* Content Sections */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          flexDirection: { xs: 'column', md: 'row' },
          overflow: 'auto', // Changed from 'hidden' to 'auto'
        }}
      >
        {/* Left Section: Resume */}
        <Box
          sx={{
            flex: { xs: 1, md: 4 },
            bgcolor: theme.palette.background.paper,
            p: 3,
            overflow: 'auto', // Added overflow
            // Removed alignItems and justifyContent
          }}
        >
          <ResumeSection />
        </Box>

        {/* Right Section: Skills */}
        <Box
          sx={{
            flex: { xs: 1, md: 6 },
            bgcolor: theme.palette.background.paper,
            p: 3,
            overflow: 'auto', // Added overflow
            // Removed alignItems and justifyContent
          }}
        >
          <Box sx={{ width: '100%' }}>
            <SkillsSection />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;