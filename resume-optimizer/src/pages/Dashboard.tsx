import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { removeAuthToken } from '../utils/auth';
import LoadingScreen from '../components/common/LoadingProgress';
import ErrorScreen from '../components/common/ErrorAlert';
import ResumeSection from '../components/dashboard/ResumeSection';
import SkillsSection from '../components/dashboard/SkillsSection';
import { Box, Typography, useTheme } from '@mui/material';
import type { Skill } from '../services/api';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [extractedSkills, setExtractedSkills] = useState<Skill[]>([]);

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

      if (!response.data) {
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
          overflow: 'auto',
        }}
      >
        {/* Left Section: Resume */}
        <Box
          sx={{
            flex: { xs: 1, md: 4 },
            bgcolor: theme.palette.background.paper,
            p: 3,
            overflow: 'auto',
          }}
        >
          <ResumeSection 
            onSkillsExtracted={(skills) => {
              console.log('Skills extracted:', skills);
              setExtractedSkills(skills);
            }} 
          />
        </Box>

        {/* Right Section: Skills */}
        <Box
          sx={{
            flex: { xs: 1, md: 6 },
            bgcolor: theme.palette.background.paper,
            p: 3,
            overflow: 'auto',
          }}
        >
          <Box sx={{ width: '100%' }}>
            <SkillsSection importedResumeSkills={extractedSkills} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;

// The dashboard presents a comprehensive skill management
// interface where users can upload their LaTeX resume and 
// manage their professional skills. On the left, it displays 
// the resume with a PDF preview, while the right section 
// organizes skills into three categories: Technical, Soft, 
// and Hard skills. The system uses the Llama 3 8B model 
// (with an 8192 token context window) through the Groq API 
// to intelligently extract and categorize skills from the 
// uploaded resume. These extracted skills appear as 
// grey chips in their respective categories, indicating 
// they need user validation through ratings. 
// Users can also manually search for and add skills using 
// the search bar, edit existing skills to update their 
// proficiency ratings (on a scale of 1-10), and delete skills
// they no longer want to showcase. Each skill is visually 
// represented by a chip whose color reflects the proficiency 
// level - from red (beginner) to green (expert). The interface 
// maintains state across components, ensuring that whether skills 
// are added manually, imported from a resume, or modified, 
// they're consistently displayed and can be saved to the backend 
// in a structured format that categorizes them as technical_skills, 
// soft_skills, or hard_skills.