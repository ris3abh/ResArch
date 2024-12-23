// ExpandableTabs.tsx
import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { motion } from 'framer-motion';
import SkillChip from './SkillChip';

interface Skill {
  id?: string;
  name: string;
  rating: number;
  category?: string;
}

interface Tab {
  title: string;
  content: string;
  skills: Skill[];
}

interface ExpandableTabsProps {
  tabs: Tab[];
  onEditSkill: (tabIndex: number, oldSkill: string, newSkill: string, newRating: number) => void;
}

const ExpandableTabs: React.FC<ExpandableTabsProps> = ({ 
  tabs, 
  onEditSkill 
}) => {
  const [openTab, setOpenTab] = useState<number | null>(null);

  const handleTabClick = (index: number) => {
    setOpenTab(openTab === index ? null : index);
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
            {/* Header section */}
            <Box sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: openTab === index ? '1px solid #EAE6F5' : 'none',
              bgcolor: openTab === index ? 'rgba(103, 58, 183, 0.04)' : 'transparent',
            }}>
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
                onClick={() => handleTabClick(index)}
                sx={{
                  transform: openTab === index ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.3s ease'
                }}
              >
                <KeyboardArrowDown />
              </IconButton>
            </Box>

            {/* Skills display section */}
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
                      skillId={skill.id}
                      onAdd={() => {}} // Empty function since we don't add from here
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