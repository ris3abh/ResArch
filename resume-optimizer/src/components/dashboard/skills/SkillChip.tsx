// src/components/skills/SkillChip.tsx
import React, { useState } from 'react';
import { Box, Chip, TextField, Slider, IconButton } from '@mui/material';
import { Add, Check, Edit, Close } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface SkillChipProps {
  isNew?: boolean;
  initialSkill?: string;
  initialRating?: number;
  onAdd: (skill: string, rating: number) => void;
  onEdit?: (oldSkill: string, newSkill: string, newRating: number) => void;
}

const getColorForRating = (rating: number): string => {
  if (rating <= 3) return '#FF8585';
  if (rating <= 5) return '#FFB649';
  if (rating <= 7) return '#FFE449';
  return '#85FF85';
};

const SkillChip: React.FC<SkillChipProps> = ({ 
  isNew = false, 
  initialSkill = '', 
  initialRating = 5,
  onAdd,
  onEdit 
}) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [skill, setSkill] = useState(initialSkill);
  const [rating, setRating] = useState(initialRating);
  const [originalSkill] = useState(initialSkill);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (skill.trim()) {
      if (isNew) {
        onAdd(skill, rating);
        setSkill('');
        setRating(5);
      } else if (onEdit) {
        onEdit(originalSkill, skill, rating);
        setIsEditing(false);
      }
    }
  };

  const handleCancel = () => {
    setSkill(initialSkill);
    setRating(initialRating);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'inline-flex',
            flexDirection: 'column',
            gap: 1,
            p: 2,
            border: '1px solid #EAE6F5',
            borderRadius: '16px',
            bgcolor: 'white',
            minWidth: '250px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <TextField
            autoFocus
            size="small"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Enter skill..."
            variant="outlined"
          />
          <Slider
            size="small"
            value={rating}
            onChange={(_, value) => setRating(value as number)}
            min={1}
            max={10}
            marks
            valueLabelDisplay="auto"
            sx={{
              color: getColorForRating(rating),
              '& .MuiSlider-rail': {
                background: 'linear-gradient(90deg, #FF8585 0%, #FFB649 30%, #FFE449 70%, #85FF85 100%)',
                opacity: 1,
              },
              '& .MuiSlider-mark': {
                backgroundColor: '#bfbfbf',
                height: 4,
              },
              '& .MuiSlider-thumb': {
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: `0px 0px 0px 8px ${getColorForRating(rating)}33`,
                },
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {!isNew && (
              <IconButton 
                size="small" 
                onClick={handleCancel}
                sx={{ color: 'grey.500' }}
              >
                <Close fontSize="small" />
              </IconButton>
            )}
            <IconButton 
              size="small" 
              onClick={() => handleSubmit()}
              sx={{ 
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(103, 58, 183, 0.04)'
                }
              }}
            >
              <Check fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </motion.div>
    );
  }

  return (
    <Chip
      label={skill}
      onClick={() => setIsEditing(true)}
      icon={isNew ? <Add /> : undefined}
      deleteIcon={!isNew ? <Edit /> : undefined}
      onDelete={!isNew ? () => setIsEditing(true) : undefined}
      sx={{
        bgcolor: isNew ? 'transparent' : getColorForRating(rating),
        border: isNew ? '1px dashed #6B6B6B' : 'none',
        borderRadius: '16px',
        '&:hover': {
          bgcolor: isNew ? 'rgba(0,0,0,0.04)' : getColorForRating(rating),
          opacity: 0.9
        },
        '& .MuiChip-deleteIcon': {
          opacity: 0,
          transition: 'opacity 0.2s ease-in-out'
        },
        '&:hover .MuiChip-deleteIcon': {
          opacity: 1
        }
      }}
    />
  );
};

export default SkillChip;