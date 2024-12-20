// src/pages/HomePage.tsx
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Stack,
  useTheme
} from '@mui/material';
import { useState } from 'react';
import resumeImage from '../assets/resume.jpg';
import { LoginModal } from '../components/auth/LoginModal';
import { SignupModal } from '../components/auth/SignupModal';

const HomePage = () => {
  const theme = useTheme();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const handleLoginSuccess = () => {
      console.log('Login successful');
  };

  const handleSignupSuccess = () => {
      console.log('Signup successful');
  };

  const switchToSignup = () => {
      setLoginOpen(false);
      setSignupOpen(true);
  };

  const switchToLogin = () => {
      setSignupOpen(false);
      setLoginOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      <Container maxWidth={false} sx={{ width: '100%', py: 8 }}>
        <Box 
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center', // Changed from space-between to center
              gap: 4,
              minHeight: 'calc(100vh - 64px)',
              flexDirection: { xs: 'column', md: 'row' }
            }}
          >
          {/* Left Section - Text Content */}
          <Box sx={{ flex: 1, maxWidth: { xs: '100%', md: '50%' } }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 'bold',
                mb: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              AI-Powered Resume Optimization
            </Typography>

            <Typography 
              variant="h2" 
              sx={{ 
                fontSize: { xs: '1.5rem', md: '2rem' },
                color: theme.palette.navy.main,
                mb: 4,
                fontWeight: 'normal'
              }}
            >
              Transform your resume with cutting-edge AI technology and land your dream job
            </Typography>

            <Typography 
              variant="body1" 
              sx={{ 
                mb: 6,
                color: 'text.secondary',
                fontSize: '1.1rem',
                lineHeight: 1.8
              }}
            >
              Our advanced AI system analyzes your resume, provides real-time optimization suggestions,
              and helps you stand out from the crowd. Get personalized recommendations, ATS-friendly
              formatting, and industry-specific keywords to maximize your chances of success.
            </Typography>

            <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
        >
          <Button
            variant="contained"
            size="large"
            onClick={() => setSignupOpen(true)}
            sx={{
              px: 4,
              py: 1.5,
              backgroundColor: theme.palette.deepPurple.main,
              boxShadow: `0 0 20px ${theme.palette.deepPurple.main}`,
              '&:hover': {
                backgroundColor: theme.palette.navy.main,
                boxShadow: `0 0 25px ${theme.palette.navy.main}`,
              }
            }}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => setLoginOpen(true)}
            sx={{
              px: 4,
              py: 1.5,
              borderColor: theme.palette.deepPurple.main,
              color: theme.palette.deepPurple.main,
              '&:hover': {
                borderColor: theme.palette.navy.main,
                color: theme.palette.navy.main,
                backgroundColor: 'transparent',
              }
            }}
          >
            Login
          </Button>
        </Stack>

          </Box>

          {/* Right Section - Resume Image */}
          <Box 
          sx={{ 
            flex: 1,
            maxWidth: { xs: '100%', md: '50%' },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 900,
              height: 600,
              backgroundColor: theme.palette.lavender.main,
              borderRadius: '30px',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(167, 130, 236, 0.3)',
            }}
          >
            <Box
              component="img"
              src={resumeImage}
              alt="Resume Preview"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '20px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
              }}
            />
          </Box>
          </Box>
        </Box>
        <LoginModal 
            open={loginOpen}
            onClose={() => setLoginOpen(false)}
            onSuccess={handleLoginSuccess}
            onSwitchToSignup={switchToSignup}
        />
        <SignupModal
            open={signupOpen}
            onClose={() => setSignupOpen(false)}
            onSuccess={handleSignupSuccess}
            onSwitchToLogin={switchToLogin}
        />
      </Container>
    </Box>
  );
};

export default HomePage;