from sqlalchemy import Column, String, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from .base import BaseModel

class SkillCategory(enum.Enum):
    TECHNICAL = "technical"
    SOFT = "soft"
    TOOL = "tool"
    LANGUAGE = "language"

class Skill(BaseModel):
    name = Column(String, nullable=False)
    category = Column(Enum(SkillCategory))
    description = Column(String)
    
class UserSkill(BaseModel):
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    skill_id = Column(Integer, ForeignKey('skill.id'), nullable=False)
    proficiency_level = Column(Integer)  # 1-5 scale
    
    user = relationship("User", backref="skills")
    skill = relationship("Skill")