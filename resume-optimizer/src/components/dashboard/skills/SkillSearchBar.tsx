import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  TextField, 
  Paper, 
  List, 
  ListItemButton, 
  ListItemText,
  Slider,
  Button,
  CircularProgress,
  Popper,
  ClickAwayListener,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../services/api';
import debounce from 'lodash/debounce';
import type { SkillCategory, Skill } from '../../../services/api';

interface SkillSearchBarProps {
  onAddSkill: (category: SkillCategory, skillName: string, rating: number) => void;
}

const getColorForRating = (rating: number): string => {
  if (rating <= 3) return '#FF8585';
  if (rating <= 5) return '#FFB649';
  if (rating <= 7) return '#FFE449';
  return '#85FF85';
};

const SkillSearchBar: React.FC<SkillSearchBarProps> = ({ onAddSkill }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>('technical');

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.searchSkills(query);
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
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, debouncedSearch]);

  const handleExpandClick = () => {
    if (searchTerm.trim()) {
      setIsExpanded(true);
    }
  };

  const handleSkillSelect = (skill: Skill) => {
    setSearchTerm(skill.name);
    setSelectedSkill(skill);
    setSelectedCategory(skill.category);
    setSearchResults([]);
    setIsExpanded(true);
  };

  const handleAddSkill = async () => {
    if (!searchTerm.trim()) return;

    try {
      onAddSkill(selectedCategory, searchTerm.trim(), rating);
      setSearchTerm('');
      setRating(5);
      setIsExpanded(false);
      setSelectedSkill(null);
      setSearchResults([]);
      setSelectedCategory('technical'); // Reset to default category
    } catch (err) {
      setError('Failed to add skill');
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1000px', position: 'relative' }}>
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search or enter a skill..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setAnchorEl(e.currentTarget);
              setSelectedSkill(null);
            }}
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
            }}
            InputProps={{
              startAdornment: (
                <Search sx={{ color: 'text.secondary', mr: 1 }} />
              ),
              endAdornment: isLoading && (
                <CircularProgress size={20} sx={{ mr: 1 }} />
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleExpandClick}
            disabled={!searchTerm.trim()}
            sx={{
              minWidth: '40px',
              width: '40px',
              height: '40px',
              p: 0,
            }}
          >
            <Add />
          </Button>
        </Box>

        {/* Search Results Popper */}
        <Popper
          open={Boolean(searchResults.length && anchorEl && !isExpanded)}
          anchorEl={anchorEl}
          placement="bottom-start"
          style={{ width: anchorEl?.clientWidth, zIndex: 1500 }}
        >
          <ClickAwayListener onClickAway={() => setSearchResults([])}>
            <Paper elevation={3} sx={{ mt: 1, maxHeight: '200px', overflow: 'auto' }}>
              <List>
                {searchResults.map((skill) => (
                  <ListItemButton
                    key={skill.id}
                    onClick={() => handleSkillSelect(skill)}
                  >
                    <ListItemText 
                      primary={skill.name}
                      secondary={`Category: ${skill.category}`}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </ClickAwayListener>
        </Popper>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Category"
                    onChange={(e) => setSelectedCategory(e.target.value as SkillCategory)}
                  >
                    <MenuItem value="technical">Technical Skills</MenuItem>
                    <MenuItem value="soft">Soft Skills</MenuItem>
                    <MenuItem value="hard">Hard Skills</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ px: 1 }}>
                  <Typography variant="caption" color="textSecondary" sx={{ mb: 1 }}>
                    Set your proficiency level
                  </Typography>
                  <Slider
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
                </Box>

                <Button
                  variant="contained"
                  onClick={handleAddSkill}
                  disabled={!searchTerm.trim()}
                  sx={{
                    mt: 1,
                    bgcolor: getColorForRating(rating),
                    color: 'black',
                    '&:hover': {
                      bgcolor: getColorForRating(rating),
                      opacity: 0.9
                    }
                  }}
                >
                  Add Skill
                </Button>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>
    </Box>
  );
};

export default SkillSearchBar;