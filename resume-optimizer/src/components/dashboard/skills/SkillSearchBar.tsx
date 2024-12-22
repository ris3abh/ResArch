// components/skills/SkillSearchBar.tsx
import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Paper, 
  List, 
  ListItemButton, 
  ListItemText,
  Slider,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface SkillSearchBarProps {
  onAddSkill: (tabIndex: number, skill: string, rating: number) => void;
}

const getColorForRating = (rating: number): string => {
  if (rating <= 3) return '#FF8585';
  if (rating <= 5) return '#FFB649';
  if (rating <= 7) return '#FFE449';
  return '#85FF85';
};

const SkillSearchBar: React.FC<SkillSearchBarProps> = ({ onAddSkill }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [selectedSection, setSelectedSection] = useState<number | ''>('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddSkill = () => {
    if (searchTerm.trim() && selectedSection !== '' && rating) {
      onAddSkill(selectedSection as number, searchTerm.trim(), rating);
      setSearchTerm('');
      setRating(5);
      setSelectedSection('');
      setIsExpanded(false);
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '800px', 
      position: 'relative',
      mb: 3
    }}>
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Enter a skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={() => setIsExpanded(true)}
            InputProps={{
              startAdornment: (
                <Search sx={{ color: 'text.secondary', mr: 1 }} />
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <Button
            variant="contained"
            onClick={() => setIsExpanded(true)}
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

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Rating Slider */}
                <Box sx={{ px: 1 }}>
                  <FormHelperText>Skill Proficiency</FormHelperText>
                  <Slider
                    value={rating}
                    onChange={(_, value) => setRating(value as number)}
                    min={1}
                    max={10}
                    marks
                    sx={{
                      color: getColorForRating(rating),
                      '& .MuiSlider-rail': {
                        background: 'linear-gradient(90deg, #FF8585 0%, #FFB649 30%, #FFE449 70%, #85FF85 100%)',
                        opacity: 1,
                      }
                    }}
                  />
                </Box>

                {/* Section Selector */}
                <FormControl fullWidth size="small">
                  <InputLabel>Skill Section</InputLabel>
                  <Select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value as number)}
                    label="Skill Section"
                  >
                    <MenuItem value={0}>Technical Skills</MenuItem>
                    <MenuItem value={1}>Soft Skills</MenuItem>
                    <MenuItem value={2}>Hard Skills</MenuItem>
                  </Select>
                </FormControl>

                {/* Add Button */}
                <Button
                  variant="contained"
                  onClick={handleAddSkill}
                  disabled={!searchTerm.trim() || selectedSection === ''}
                  sx={{
                    mt: 1,
                    bgcolor: getColorForRating(rating),
                    color: 'black',
                    '&:hover': {
                      bgcolor: getColorForRating(rating),
                      opacity: 0
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