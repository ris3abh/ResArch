// src/components/skills/SkillsSection.tsx
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import ExpandableTabs from './skills/ExpandableTabs';
import SkillSearchBar from './skills/SkillSearchBar';

interface Skill {
  name: string;
  rating: number;
}

interface Tab {
  title: string;
  content: string;
  skills: Skill[];
}

const SkillsSection: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      title: "Technical Skills",
      content: "Programming languages, frameworks, and development tools",
      skills: []
    },
    {
      title: "Soft Skills",
      content: "Interpersonal abilities and professional attributes",
      skills: []
    },
    {
      title: "Hard Skills",
      content: "Specific, measurable abilities and domain knowledge",
      skills: []
    }
  ]);

  const handleAddSkill = (tabIndex: number, skillName: string, rating: number) => {
    setTabs(prevTabs => {
      const newTabs = [...prevTabs];
      const existingSkillIndex = newTabs[tabIndex].skills.findIndex(
        skill => skill.name.toLowerCase() === skillName.toLowerCase()
      );

      if (existingSkillIndex === -1) {
        newTabs[tabIndex].skills.push({ name: skillName, rating });
      }
      
      return newTabs;
    });
  };

  const handleEditSkill = (
    tabIndex: number, 
    oldSkill: string, 
    newSkill: string, 
    newRating: number
  ) => {
    setTabs(prevTabs => {
      const newTabs = [...prevTabs];
      const skillIndex = newTabs[tabIndex].skills.findIndex(
        skill => skill.name === oldSkill
      );
      
      if (skillIndex !== -1) {
        newTabs[tabIndex].skills[skillIndex] = {
          name: newSkill,
          rating: newRating
        };
      }
      
      return newTabs;
    });
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 3,
      width: '100%'
    }}>
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 600,
          color: 'primary.main'
        }}
      >
        Skills Management
      </Typography>
      <SkillSearchBar onAddSkill={handleAddSkill} />
      <ExpandableTabs 
        tabs={tabs}
        onAddSkill={handleAddSkill}
        onEditSkill={handleEditSkill}
      />
    </Box>
  );
};

export default SkillsSection;