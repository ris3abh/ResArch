// components/skills/SkillRater.tsx
import React, { useState } from 'react';
import { Box, Slider, TextField, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface SkillRaterProps {
  onSave: (skillName: string, rating: number) => void;
}

const ColoredSlider = styled(Slider)(({ value }: { value: number }) => ({
  color: getColorForRating(value),
  '& .MuiSlider-thumb': {
    '&:hover, &.Mui-focusVisible': {
      boxShadow: `0px 0px 0px 8px ${getColorForRating(value)}33`,
    },
  },
  '& .MuiSlider-rail': {
    background: 'linear-gradient(90deg, #FFE5E5 0%, #FFF4E5 30%, #FFFFE5 70%, #E5FFE5 100%)',
    opacity: 1,
  },
}));

const getColorForRating = (rating: number): string => {
  if (rating <= 3) return '#FFE5E5';
  if (rating <= 5) return '#FFF4E5';
  if (rating <= 7) return '#FFFFE5';
  return '#E5FFE5';
};

const SkillRater: React.FC<SkillRaterProps> = ({ onSave }) => {
  const [skillName, setSkillName] = useState('');
  const [rating, setRating] = useState<number>(5);

  const handleSave = () => {
    if (skillName.trim()) {
      onSave(skillName, rating);
      setSkillName('');
      setRating(5);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '600px', p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Enter your skill"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          placeholder="Enter your skill..."
          variant="outlined"
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>
          Rate your proficiency: {rating}
        </Typography>
        <ColoredSlider
          value={rating}
          onChange={(_, newValue) => setRating(newValue as number)}
          min={1}
          max={10}
          step={1}
          marks
          valueLabelDisplay="auto"
        />
      </Box>

      <Button
        variant="contained"
        onClick={handleSave}
        disabled={!skillName.trim()}
        sx={{
          backgroundColor: getColorForRating(rating),
          color: '#2D2D2D',
          '&:hover': {
            backgroundColor: getColorForRating(rating),
            opacity: 0.9,
          },
        }}
      >
        Save Skill
      </Button>
    </Box>
  );
};

export default SkillRater;