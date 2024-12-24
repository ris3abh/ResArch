import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import dashboard from '../../assets/dashboard.png';
import template from '../../assets/template.png';
import resume from '../../assets/resume.png';

interface Feature {
  id: number;
  title: string;
  description: string;
  image: string;
}

const features: Feature[] = [
  {
    id: 1,
    title: "Skill Radar",
    description: "AI-powered skill extraction from your resume",
    image: resume
  },
  {
    id: 2,
    title: "Match Master",
    description: "Smart job matching with your skillset",
    image: dashboard
  },
  {
    id: 3,
    title: "Resume Refiner",
    description: "Targeted resume optimization",
    image: template
  },
  {
    id: 4,
    title: "Letter Logic",
    description: "Automated cover letter generation",
    image: template
  }
];

const FeatureShowcase: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<number>(1);

  return (
    <Box 
      sx={{ 
        display: 'flex',
        // <-- This reverses columns only on medium+ screens.
        flexDirection: { xs: 'column', md: 'row-reverse' }, 
        gap: 29,
        alignItems: 'flex-start',
        width: '100%',
        flexWrap: 'wrap',
      }}
    >
      {/* Image Display (now shown on the left on md+ screens) */}
      <Box
        sx={{ 
          width: '100%',
          maxWidth: '890px',
          minHeight: '450px',
          position: 'relative',
          borderRadius: '40px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(167,130,236,0.3)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0 auto',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedFeature}
            src={features.find(f => f.id === selectedFeature)?.image}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '20px',
            }}
            alt={features.find(f => f.id === selectedFeature)?.title}
          />
        </AnimatePresence>
      </Box>

      {/* Features List (now shown on the right on md+ screens) */}
      <Box sx={{ flex: '0 0 auto', minWidth: '280px', mb: { xs: 4, md: 0 } }}>
        {features.map((feature) => (
          <Box
            key={feature.id}
            component={motion.div}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedFeature(feature.id)}
            sx={{
              position: 'relative',
              mb: 3,
              p: 3,
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: selectedFeature === feature.id 
                ? 'linear-gradient(45deg, rgba(103,58,183,0.1), rgba(156,39,176,0.1))'
                : 'transparent',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: -16,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: selectedFeature === feature.id
                  ? 'linear-gradient(45deg, #673AB7, #9C27B0)'
                  : 'transparent',
              }}
            >
              <Typography
                sx={{
                  color: selectedFeature === feature.id ? 'white' : '#673AB7',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}
              >
                {feature.id}
              </Typography>
            </Box>

            <Typography
              variant="h6"
              sx={{
                background: 'linear-gradient(45deg, #673AB7, #9C27B0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: selectedFeature === feature.id ? 'bold' : 'medium',
                fontSize: '1.2rem',
                mb: 1
              }}
            >
              {feature.title}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.9rem'
              }}
            >
              {feature.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default FeatureShowcase;
