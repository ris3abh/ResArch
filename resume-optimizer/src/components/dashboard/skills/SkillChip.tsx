import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Chip, 
  TextField, 
  Slider, 
  IconButton,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Popper,
  ClickAwayListener
} from '@mui/material';
import { Add, Check, Edit, Close } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { api } from '../../../services/api';
import debounce from 'lodash/debounce';

interface SkillChipProps {
  isNew?: boolean;
  initialSkill?: string;
  initialRating?: number;
  skillId?: string;
  onAdd: (skill: string, rating: number) => void;
  onEdit?: (oldSkill: string, newSkill: string, newRating: number) => void;
}

interface Skill {
  id: string;
  name: string;
  category?: string;
  description?: string;
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
  skillId,
  onAdd,
  onEdit 
}) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [skill, setSkill] = useState(initialSkill);
  const [rating, setRating] = useState(initialRating);
  const [originalSkill] = useState(initialSkill);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Skill[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.searchSkills(query);
        console.log('Search response:', response);
        if (response.error) {
          throw new Error(response.error);
        }
        if (response.data) {
          setSearchResults(response.data);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Failed to search skills');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (isEditing && skill) {
      debouncedSearch(skill);
    } else {
      setSearchResults([]);
    }
  }, [skill, isEditing, debouncedSearch]);

  const handleSubmit = async (e?: React.FormEvent, selectedSkill?: Skill) => {
    e?.preventDefault();
    if (skill.trim()) {
      setIsLoading(true);
      setError(null);

      try {
        const skillToUse = selectedSkill || { id: skillId || 'custom', name: skill.trim() };
        
        await api.addUserSkill({
          skill_id: skillToUse.id,
          proficiency_level: rating,
          user_id: 'current'
        });

        if (isNew) {
          onAdd(skillToUse.name, rating);
          setSkill('');
          setRating(5);
        } else if (onEdit) {
          onEdit(originalSkill, skillToUse.name, rating);
          setIsEditing(false);
        }
        
        setSearchResults([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save skill');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setSkill(initialSkill);
    setRating(initialRating);
    setIsEditing(false);
    setError(null);
    setSearchResults([]);
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
            position: 'relative',
          }}
        >
          <TextField
            autoFocus
            size="small"
            value={skill}
            onChange={(e) => {
              setSkill(e.target.value);
              setAnchorEl(e.currentTarget);
            }}
            placeholder="Search or enter skill..."
            variant="outlined"
            error={Boolean(error)}
            helperText={error}
            InputProps={{
              endAdornment: isLoading && <CircularProgress size={20} />,
            }}
          />

          {/* Search Results Popper */}
          <Popper
            open={Boolean(searchResults.length && anchorEl)}
            anchorEl={anchorEl}
            placement="bottom-start"
            style={{ width: anchorEl?.clientWidth, zIndex: 1500 }}
          >
            <ClickAwayListener onClickAway={() => setSearchResults([])}>
              <Paper elevation={3} sx={{ mt: 1, maxHeight: '200px', overflow: 'auto' }}>
                <List>
                  {searchResults.map((searchSkill) => (
                    <ListItemButton
                      key={searchSkill.id}
                      onClick={() => {
                        setSkill(searchSkill.name);
                        handleSubmit(undefined, searchSkill);
                        setSearchResults([]);
                      }}
                    >
                      <ListItemText 
                        primary={searchSkill.name}
                        secondary={searchSkill.category}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            </ClickAwayListener>
          </Popper>

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
              disabled={isLoading}
              sx={{ 
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(103, 58, 183, 0.04)'
                }
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <Check fontSize="small" />
              )}
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