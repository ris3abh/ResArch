// src/pages/Templates.tsx
import React from 'react';
import { Box, Card, CardContent, CardMedia, Typography, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Import images
import andrewRyanTemplate from '@/assets/resumes/AndrewRyan.png';
import yuansTemplate from '@/assets/resumes/Yuans.png';
import compactTemplate from '@/assets/resumes/VeryCompact.png';
import engineeringTemplate from '@/assets/resumes/EngineeringResumes.png';

const templates = [
  {
    id: 1,
    name: 'Professional',
    description: 'Clean and modern professional template',
    image: andrewRyanTemplate
  },
  {
    id: 2,
    name: 'Academic',
    description: 'Perfect for research and academic positions',
    image: yuansTemplate
  },
  {
    id: 3,
    name: 'Compact',
    description: 'A compact layout best for 10+ Years of experience',
    image: compactTemplate
  },
  {
    id: 4,
    name: 'Technical',
    description: 'Ideal for technical roles and developers',
    image: engineeringTemplate
  }
];

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      p: 4,
      maxWidth: '1200px', // Added for better layout on wide screens
      margin: '0 auto'    // Center the content
    }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 4, 
          color: 'deepPurple.main',
          fontWeight: 600,
          textAlign: { xs: 'center', md: 'left' }
        }}
      >
        Choose Your Template
      </Typography>
      
      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={3} key={template.id}>
            <Card 
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                }
              }}
              onClick={() => navigate(`/`)}
            >
              <CardMedia
                component="img"
                height="400"  // Increased height for better preview
                image={template.image}
                alt={template.name}
                sx={{
                  objectFit: 'contain',  // This will show the full resume without cropping
                  bgcolor: '#f5f5f5'     // Light background for the image
                }}
              />
              <CardContent>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 500,
                    mb: 1
                  }}
                >
                  {template.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                >
                  {template.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TemplatesPage;