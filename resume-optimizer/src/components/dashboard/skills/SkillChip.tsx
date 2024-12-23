// src/components/skills/SkillChip.tsx
import React, { useState } from 'react';
import { 
  Box, 
  Chip, 
  TextField, 
  Slider, 
  IconButton,
  CircularProgress,
  Paper,
  Typography,
  Menu,
  MenuItem
} from '@mui/material';
import { Check, Edit, Close, MoreVert, Delete } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { api } from '../../../services/api';
import type { SkillCategory } from '../../../services/api';

interface SkillChipProps {
  initialSkill: string;
  initialRating?: number;
  category: SkillCategory;
  isFromResume?: boolean;
  onEdit: (oldSkill: string, newSkill: string, newRating: number) => void;
  onDelete: (skillName: string) => void;
}

// This function determines the background color
const getColorForRating = (rating: number | undefined, isFromResume: boolean): string => {
  // If it's from resume and has no rating yet, show grey
  if (isFromResume && (!rating || rating === 0)) {
    return '#E0E0E0';
  }
  if (!rating || rating <= 3) return '#FF8585';
  if (rating <= 5) return '#FFB649';
  if (rating <= 7) return '#FFE449';
  return '#85FF85';
};

const SkillChip: React.FC<SkillChipProps> = ({ 
  initialSkill, 
  initialRating,
  category,
  isFromResume = false,
  onEdit,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [skill, setSkill] = useState(initialSkill);
  // If isFromResume and rating is not provided, start them at 0 or 5. 
  // We'll default to 5 here, but you could do 0 if you want them to pick a rating from scratch.
  const [rating, setRating] = useState(initialRating !== undefined ? initialRating : 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSubmit = async () => {
    if (skill.trim()) {
      setIsLoading(true);
      setError(null);

      try {
        // Call your API to add or update the skill
        await api.addSingleUserSkill({
          name: skill.trim(),
          rating,
          category
        });

        // Let parent know
        onEdit(initialSkill, skill.trim(), rating);
        setIsEditing(false);

        console.log('Skill Updated:', { name: skill.trim(), rating, category });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save skill');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = () => {
    setAnchorEl(null);
    onDelete(initialSkill);
    console.log('Skill Deleted:', { name: initialSkill, category });
  };

  const handleCancel = () => {
    setSkill(initialSkill);
    setRating(initialRating || 0);
    setIsEditing(false);
    setError(null);
  };

  // If editing, show the rating slider & textfield
  if (isEditing) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <Paper
          elevation={2}
          sx={{
            display: 'inline-flex',
            flexDirection: 'column',
            gap: 1,
            p: 2,
            minWidth: '250px',
          }}
        >
          <TextField
            autoFocus
            size="small"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Enter skill name..."
            error={Boolean(error)}
            helperText={error}
          />

          <Box sx={{ px: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Proficiency Level
            </Typography>
            <Slider
              size="small"
              value={rating}
              onChange={(_, value) => setRating(value as number)}
              min={1}
              max={10}
              marks
              valueLabelDisplay="auto"
              sx={{
                color: getColorForRating(rating, false),
                '& .MuiSlider-rail': {
                  background: 'linear-gradient(90deg, #FF8585 0%, #FFB649 30%, #FFE449 70%, #85FF85 100%)',
                  opacity: 1,
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <IconButton 
              size="small" 
              onClick={handleCancel}
              sx={{ color: 'grey.500' }}
            >
              <Close fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={handleSubmit}
              disabled={isLoading}
              sx={{ color: 'primary.main' }}
            >
              {isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <Check fontSize="small" />
              )}
            </IconButton>
          </Box>
        </Paper>
      </motion.div>
    );
  }

  // Otherwise, show a Chip with a context menu (for delete)
  return (
    <>
      <Chip
        label={skill}
        onClick={() => setIsEditing(true)}
        deleteIcon={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              size="small"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              sx={{ p: 0 }}
            >
              <Edit fontSize="small" sx={{ opacity: 0.7 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                setAnchorEl(e.currentTarget);
              }}
              sx={{ p: 0 }}
            >
              <MoreVert fontSize="small" sx={{ opacity: 0.7 }} />
            </IconButton>
          </Box>
        }
        onDelete={() => {}}
        sx={{
          bgcolor: getColorForRating(rating, isFromResume),
          borderRadius: '16px',
          '&:hover': {
            bgcolor: getColorForRating(rating, isFromResume),
            opacity: 0.9
          },
          '& .MuiChip-deleteIcon': {
            opacity: 0,
            transition: 'opacity 0.2s ease-in-out',
            mr: 0.5,
          },
          '&:hover .MuiChip-deleteIcon': {
            opacity: 1
          }
        }}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Skill
        </MenuItem>
      </Menu>
    </>
  );
};

export default SkillChip;
