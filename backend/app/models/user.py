# models/user.py
from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel

class User(BaseModel):
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    github_username = Column(String)
    
    skills = relationship("UserSkill", back_populates="user")
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    # job_applications = relationship("JobApplication", back_populates="user")