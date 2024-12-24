from sqlalchemy import Column, String, Enum, ForeignKey, Float
from sqlalchemy.orm import relationship
from .base import BaseModel, SQLiteUUID  # Import SQLiteUUID from base
import enum

class SkillCategory(enum.Enum):
    SOFT = "soft"
    TECHNICAL = "technical"
    HARD = "hard"

class Skill(BaseModel):
    name = Column(String, unique=True, nullable=False)
    category = Column(Enum(SkillCategory), nullable=False)
    source = Column(String, nullable=True)
    description = Column(String, nullable=True)

class UserSkill(BaseModel):
    user_id = Column(SQLiteUUID(), ForeignKey("user.id"), nullable=False)
    skill_id = Column(SQLiteUUID(), ForeignKey("skill.id"), nullable=False)
    rating = Column(Float, nullable=False, default=5.0)

    skill = relationship("Skill", backref="user_skills", lazy="joined")
    user = relationship("User", back_populates="skills")