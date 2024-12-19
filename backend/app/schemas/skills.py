from pydantic import BaseModel
from .base import BaseSchema
from app.models.skills import SkillCategory

class SkillBase(BaseModel):
    name: str
    category: SkillCategory
    description: str | None = None

class SkillCreate(SkillBase):
    pass

class Skill(SkillBase, BaseSchema):
    pass

class UserSkillBase(BaseModel):
    user_id: int
    skill_id: int
    proficiency_level: int

class UserSkillCreate(UserSkillBase):
    pass

class UserSkill(UserSkillBase, BaseSchema):
    skill: Skill