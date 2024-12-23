// src/components/skills/SkillsSection.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Save } from '@mui/icons-material';
import ExpandableTabs from './skills/ExpandableTabs';
import SkillSearchBar from './skills/SkillSearchBar';
import { api } from '../../services/api';
import type { SkillCategory, BatchSkillsByCategory, Skill } from '../../services/api';

type SkillsState = BatchSkillsByCategory & {
  // we can store an extra "isFromResume" on each item
};

interface SkillsSectionProps {
  // From the resume extraction, if we want to merge them
  importedResumeSkills?: Skill[];
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ importedResumeSkills }) => {
  const [skillsState, setSkillsState] = useState<SkillsState>({
    hard_skills: [],
    soft_skills: [],
    technical_skills: []
  });

  useEffect(() => {
    // Load existing user skills on mount
    const loadSkills = async () => {
      try {
        const response = await api.getUserSkills(); // your existing endpoint
        if (response.data) {
          const categorizedSkills: SkillsState = {
            hard_skills: [],
            soft_skills: [],
            technical_skills: []
          };

          // Suppose response.data is array of userSkills: { skill: { name, category }, rating, ... }
          response.data.forEach((userSkill: any) => {
            const skillData = {
              name: userSkill.skill.name,
              rating: userSkill.rating,
              isFromResume: false
            };
            switch (userSkill.skill.category) {
              case 'hard':
                categorizedSkills.hard_skills.push(skillData);
                break;
              case 'soft':
                categorizedSkills.soft_skills.push(skillData);
                break;
              case 'technical':
                categorizedSkills.technical_skills.push(skillData);
                break;
            }
          });
          setSkillsState(categorizedSkills);
        }
      } catch (error) {
        console.error('Error loading skills:', error);
      }
    };
    loadSkills();
  }, []);

  // MERGE resume-based skills as unrated, if not already present
  useEffect(() => {
    if (importedResumeSkills && importedResumeSkills.length > 0) {
      setSkillsState(prevState => {
        const newState = { ...prevState };

        importedResumeSkills.forEach(resSkill => {
          const { name, category } = resSkill;

          // We'll store rating = 0 or undefined, isFromResume = true
          const skillData = { 
            name, 
            rating: 0, 
            isFromResume: true 
          };

          if (category === 'technical') {
            const alreadyExists = newState.technical_skills.some(s => s.name.toLowerCase() === name.toLowerCase());
            if (!alreadyExists) {
              newState.technical_skills.push(skillData);
            }
          } else if (category === 'soft') {
            const alreadyExists = newState.soft_skills.some(s => s.name.toLowerCase() === name.toLowerCase());
            if (!alreadyExists) {
              newState.soft_skills.push(skillData);
            }
          } else if (category === 'hard') {
            const alreadyExists = newState.hard_skills.some(s => s.name.toLowerCase() === name.toLowerCase());
            if (!alreadyExists) {
              newState.hard_skills.push(skillData);
            }
          }
        });
        return newState;
      });
    }
  }, [importedResumeSkills]);

  // Handlers for adding, editing, deleting, saving, etc.
  const handleAddSkill = (category: SkillCategory, skillName: string, rating: number) => {
    setSkillsState(prevState => {
      const newState = { ...prevState };
      const newSkill = { name: skillName, rating, isFromResume: false };

      switch (category) {
        case 'hard':
          if (!newState.hard_skills.some(s => s.name === skillName)) {
            newState.hard_skills = [...newState.hard_skills, newSkill];
          }
          break;
        case 'soft':
          if (!newState.soft_skills.some(s => s.name === skillName)) {
            newState.soft_skills = [...newState.soft_skills, newSkill];
          }
          break;
        case 'technical':
          if (!newState.technical_skills.some(s => s.name === skillName)) {
            newState.technical_skills = [...newState.technical_skills, newSkill];
          }
          break;
      }
      return newState;
    });
  };

  const handleEditSkill = (category: SkillCategory, oldSkill: string, newSkill: string, newRating: number) => {
    setSkillsState(prevState => {
      const newState = { ...prevState };

      function mapFn(skill: any) {
        if (skill.name === oldSkill) {
          return { ...skill, name: newSkill, rating: newRating, isFromResume: false };
        }
        return skill;
      }

      switch (category) {
        case 'hard':
          newState.hard_skills = newState.hard_skills.map(mapFn);
          break;
        case 'soft':
          newState.soft_skills = newState.soft_skills.map(mapFn);
          break;
        case 'technical':
          newState.technical_skills = newState.technical_skills.map(mapFn);
          break;
      }
      return newState;
    });
  };

  const handleDeleteSkill = (category: SkillCategory, skillName: string) => {
    setSkillsState(prevState => {
      const newState = { ...prevState };

      switch (category) {
        case 'hard':
          newState.hard_skills = newState.hard_skills.filter(skill => skill.name !== skillName);
          break;
        case 'soft':
          newState.soft_skills = newState.soft_skills.filter(skill => skill.name !== skillName);
          break;
        case 'technical':
          newState.technical_skills = newState.technical_skills.filter(skill => skill.name !== skillName);
          break;
      }
      return newState;
    });
  };

  const handleSaveAllSkills = async () => {
    try {
      const response = await api.saveBatchSkills(skillsState); // hypothetical
      if (response.error) {
        throw new Error(response.error);
      }
      console.log('All skills saved successfully');
    } catch (error) {
      console.error('Error saving skills:', error);
    }
  };

  // Convert skillsState to tabs format
  const tabs = [
    {
      title: "Technical Skills",
      content: "Programming languages, frameworks, and development tools",
      skills: skillsState.technical_skills,
      category: 'technical' as SkillCategory
    },
    {
      title: "Soft Skills",
      content: "Interpersonal abilities and professional attributes",
      skills: skillsState.soft_skills,
      category: 'soft' as SkillCategory
    },
    {
      title: "Hard Skills",
      content: "Specific, measurable abilities and domain knowledge",
      skills: skillsState.hard_skills,
      category: 'hard' as SkillCategory
    }
  ];

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 3,
      width: '100%'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 1000,
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
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSaveAllSkills}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            }
          }}
        >
          Save All Skills
        </Button>
      </Box>

      <SkillSearchBar onAddSkill={handleAddSkill} />
      <ExpandableTabs 
        tabs={tabs}
        onEditSkill={handleEditSkill}
        onDeleteSkill={handleDeleteSkill}
      />
    </Box>
  );
};

export default SkillsSection;
