# schemas/skills.py
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from enum import Enum

class SkillCategory(str, Enum):
    soft = "soft"
    technical = "technical"
    hard = "hard"

class SkillBase(BaseModel):
    name: str
    category: SkillCategory

class SkillCreate(SkillBase):
    source: Optional[str] = None

class Skill(SkillBase):
    id: int
    source: Optional[str]

    class Config:
        orm_mode = True

class UserSkillBase(BaseModel):
    skill_id: int
    rating: float = Field(ge=0, le=10)  # Rating between 0 and 5

class UserSkillCreate(UserSkillBase):
    pass

class UserSkill(UserSkillBase):
    id: int
    skill: Skill

    class Config:
        orm_mode = True

# New schemas for batch operations
class SkillWithRating(BaseModel):
    name: str
    rating: float = Field(ge=1, le=10)

class BatchSkillsByCategory(BaseModel):
    hard_skills: List[SkillWithRating] = []
    soft_skills: List[SkillWithRating] = []
    technical_skills: List[SkillWithRating] = []

# Schema for individual skill creation with category
class SingleSkillCreate(BaseModel):
    name: str
    rating: float = Field(ge=1, le=10)
    category: SkillCategory