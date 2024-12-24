# schemas/skills.py
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from uuid import UUID
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
    id: UUID
    source: Optional[str]

    class Config:
        from_attributes = True

class UserSkillBase(BaseModel):
    skill_id: UUID
    rating: float = Field(ge=0, le=10)

class UserSkillCreate(UserSkillBase):
    pass

class UserSkill(UserSkillBase):
    id: UUID
    skill: Skill

    class Config:
        from_attributes = True

# Rest of the schemas remain the same
class SkillWithRating(BaseModel):
    name: str
    rating: float = Field(ge=1, le=10)

class BatchSkillsByCategory(BaseModel):
    hard_skills: List[SkillWithRating] = []
    soft_skills: List[SkillWithRating] = []
    technical_skills: List[SkillWithRating] = []

class SingleSkillCreate(BaseModel):
    name: str
    rating: float = Field(ge=1, le=10)
    category: SkillCategory