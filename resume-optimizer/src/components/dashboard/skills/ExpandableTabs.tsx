// src/components/skills/ExpandableTabs.tsx
import React, { useState } from 'react';
import { Box, Typography, IconButton, TextField, Slider } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Add } from '@mui/icons-material';
import { motion } from 'framer-motion';
import SkillChip from './SkillChip';

interface Skill {
  name: string;
  rating: number;
}

interface Tab {
  title: string;
  content: string;
  skills: Skill[];
}

interface ExpandableTabsProps {
  tabs: Tab[];
  onAddSkill: (tabIndex: number, skill: string, rating: number) => void;
  onEditSkill: (tabIndex: number, oldSkill: string, newSkill: string, newRating: number) => void;
}

const ExpandableTabs: React.FC<ExpandableTabsProps> = ({ 
  tabs, 
  onAddSkill,
  onEditSkill 
}) => {
  const [openTab, setOpenTab] = useState<number | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [rating, setRating] = useState(5);
  const [activeInputTab, setActiveInputTab] = useState<number | null>(null);

  const handleTabClick = (index: number) => {
    setOpenTab(openTab === index ? null : index);
  };

  const handleAddClick = (index: number) => {
    setActiveInputTab(activeInputTab === index ? null : index);
    setOpenTab(index);  // Auto-open tab when adding skill
  };

  const handleSubmit = (tabIndex: number) => {
    if (newSkill.trim()) {
      onAddSkill(tabIndex, newSkill.trim(), rating);
      setNewSkill('');
      setRating(5);
      setActiveInputTab(null);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '800px' }}>
      {tabs.map((tab, index) => (
        <motion.div
          key={index}
          initial={false}
          animate={{ backgroundColor: openTab === index ? '#F8F7FD' : '#FFFFFF' }}
        >
          <Box
            sx={{
              border: '1px solid #EAE6F5',
              borderRadius: '8px',
              mb: 2,
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}
          >
            <Box sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: openTab === index ? '1px solid #EAE6F5' : 'none',
              bgcolor: openTab === index ? 'rgba(103, 58, 183, 0.04)' : 'transparent',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Typography
                  variant="h6"
                  onClick={() => handleTabClick(index)}
                  sx={{ 
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: openTab === index ? 600 : 500,
                  }}
                >
                  {tab.title}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleAddClick(index)}
                  sx={{ 
                    ml: 'auto',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'rgba(103, 58, 183, 0.1)'
                    }
                  }}
                >
                  <Add />
                </IconButton>
              </Box>
              <IconButton 
                size="small" 
                onClick={() => handleTabClick(index)}
                sx={{
                  transform: openTab === index ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.3s ease'
                }}
              >
                <KeyboardArrowDown />
              </IconButton>
            </Box>

            {activeInputTab === index && openTab === index && (
              <Box sx={{ p: 2, borderBottom: '1px solid #EAE6F5' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Enter skill..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmit(index);
                      }
                    }}
                    autoFocus
                    sx={{ flex: 1 }}
                  />
                  <Box sx={{ width: '200px' }}>
                    <Slider
                      size="small"
                      value={rating}
                      onChange={(_, value) => setRating(value as number)}
                      min={1}
                      max={10}
                      marks
                      sx={{
                        '& .MuiSlider-rail': {
                          background: 'linear-gradient(90deg, #FF8585 0%, #FFB649 30%, #FFE449 70%, #85FF85 100%)',
                          opacity: 1,
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {openTab === index && (
              <Box sx={{ p: 2 }}>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  {tab.content}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 1.5,
                  '& > *': {
                    margin: '4px',
                  }
                }}>
                  {tab.skills.map((skill, skillIndex) => (
                    <SkillChip
                      key={skillIndex}
                      initialSkill={skill.name}
                      initialRating={skill.rating}
                      onAdd={(newSkill, rating) => onAddSkill(index, newSkill, rating)}
                      onEdit={(oldSkill, newSkill, newRating) => 
                        onEditSkill(index, oldSkill, newSkill, newRating)
                      }
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </motion.div>
      ))}
    </Box>
  );
};

export default ExpandableTabs;