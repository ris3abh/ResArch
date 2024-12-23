# models/skills.py
from sqlalchemy import Column, String, Integer, Enum, ForeignKey, Float
from sqlalchemy.orm import relationship
from .base import BaseModel  # Change this from Base
import enum

class SkillCategory(enum.Enum):
    SOFT = "soft"
    TECHNICAL = "technical"
    HARD = "hard"

class Skill(BaseModel):  # Change from Base to BaseModel
    name = Column(String, unique=True, nullable=False)
    category = Column(Enum(SkillCategory), nullable=False)
    source = Column(String, nullable=True)
    description = Column(String, nullable=True)  # Add this line
    
    # No need to define __tablename__ as it comes from BaseModel
    # No need to define id as it comes from BaseModel

class UserSkill(BaseModel):  # Change from Base to BaseModel
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)  # Change from users to user
    skill_id = Column(Integer, ForeignKey("skill.id"), nullable=False)  # Change from skills to skill
    rating = Column(Float, nullable=False, default=5.0)

    skill = relationship("Skill", backref="user_skills")
    user = relationship("User", back_populates="skills")