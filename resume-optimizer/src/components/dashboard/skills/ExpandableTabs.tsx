// src/components/skills/ExpandableTabs.tsx
import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { KeyboardArrowDown, AddCircleOutline } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import SkillChip from './SkillChip';
import type { SkillWithRating, SkillCategory } from '../../../services/api';

interface Tab {
  title: string;
  content: string;
  skills: SkillWithRating[];
  category: SkillCategory;
}

interface ExpandableTabsProps {
  tabs: Tab[];
  onEditSkill: (category: SkillCategory, oldSkill: string, newSkill: string, newRating: number) => void;
  onDeleteSkill: (category: SkillCategory, skillName: string) => void;
}

const ExpandableTabs: React.FC<ExpandableTabsProps> = ({ tabs, onEditSkill, onDeleteSkill }) => {
  const [openTab, setOpenTab] = useState<number | null>(0); // first tab open by default

  const handleTabClick = (index: number) => {
    setOpenTab(openTab === index ? null : index);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1000px' }}>
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
            {/* Header */}
            <Box
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: openTab === index ? '1px solid #EAE6F5' : 'none',
                bgcolor: openTab === index ? 'rgba(103, 58, 183, 0.04)' : 'transparent',
                cursor: 'pointer',
              }}
              onClick={() => handleTabClick(index)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ 
                    fontSize: '1.1rem',
                    fontWeight: openTab === index ? 600 : 500,
                  }}
                >
                  {tab.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    bgcolor: 'rgba(103, 58, 183, 0.1)',
                    px: 1,
                    py: 0.5,
                    borderRadius: '12px',
                  }}
                >
                  {tab.skills.length}
                </Typography>
              </Box>
              <IconButton 
                size="small" 
                sx={{
                  transform: openTab === index ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.3s ease'
                }}
              >
                <KeyboardArrowDown />
              </IconButton>
            </Box>

            {/* Content */}
            <AnimatePresence>
              {openTab === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box sx={{ p: 2 }}>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      {tab.content}
                    </Typography>
                    
                    {tab.skills.length === 0 ? (
                      <Box 
                        sx={{ 
                          p: 3, 
                          textAlign: 'center',
                          border: '2px dashed #EAE6F5',
                          borderRadius: '8px'
                        }}
                      >
                        <AddCircleOutline sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography color="text.secondary">
                          No {tab.title.toLowerCase()} added yet. Use the search bar above to add skills.
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 1.5
                      }}>
                        {tab.skills.map((skill, skillIndex) => (
                          <SkillChip
                            key={`${skill.name}-${skillIndex}`}
                            initialSkill={skill.name}
                            initialRating={skill.rating}
                            category={tab.category}
                            // Pass isFromResume if present
                            isFromResume={skill.isFromResume === true}
                            onEdit={(oldSkill, newSkill, newRating) => 
                              onEditSkill(tab.category, oldSkill, newSkill, newRating)
                            }
                            onDelete={(skillName) => onDeleteSkill(tab.category, skillName)}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </motion.div>
      ))}
    </Box>
  );
};

export default ExpandableTabs;
