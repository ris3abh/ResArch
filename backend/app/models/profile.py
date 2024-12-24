from sqlalchemy import Column, String, ForeignKey, Text, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import enum
from datetime import datetime
from .base import BaseModel

class ProfileType(str, enum.Enum):
    ACADEMIC = "academic"
    PROFESSIONAL = "professional"

class UserProfile(BaseModel):
    user_id = Column(UUID(as_uuid=True), ForeignKey('user.id'), unique=True)
    profile_type = Column(Enum(ProfileType), nullable=False)
    
    user = relationship("User", back_populates="profile")
    experiences = relationship("WorkExperience", back_populates="profile")

class WorkExperience(BaseModel):
    profile_id = Column(UUID(as_uuid=True), ForeignKey('userprofile.id'))
    company_name = Column(String, nullable=False)
    position = Column(String, nullable=False)
    location = Column(String, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)  # Null for current positions
    description = Column(Text, nullable=False)
    
    profile = relationship("UserProfile", back_populates="experiences")