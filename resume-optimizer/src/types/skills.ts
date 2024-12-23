// types/skills.ts

export interface ApiSkill {
    id: number;
    name: string;
    category?: string;
    description?: string;
    source?: string;
  }
  
  export interface ApiUserSkill {
    id: number;
    user_id: number;
    skill_id: number;
    proficiency_level: number;
    skill: ApiSkill;
  }
  
  // Frontend interfaces
  export interface Skill {
    id?: string;
    name: string;
    rating: number;
    category?: string;
  }
  
  export interface Tab {
    title: string;
    content: string;
    skills: Skill[];
  }
  
  export interface BatchSkillsByCategory {
    hard_skills: SkillWithRating[];
    soft_skills: SkillWithRating[];
    technical_skills: SkillWithRating[];
  }
  
  export interface SkillWithRating {
    name: string;
    rating: number;
  }
  
  // API request interfaces
  export interface UserSkillCreate {
    skill_id: string | number;
    proficiency_level: number;
  }