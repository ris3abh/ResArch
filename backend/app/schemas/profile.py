# schemas/profile.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from uuid import UUID
from enum import Enum

class ProfileType(str, Enum):
    ACADEMIC = "academic"
    PROFESSIONAL = "professional"

class UserProfileBase(BaseModel):
    profile_type: ProfileType

class UserProfileCreate(UserProfileBase):
    pass

class UserProfile(UserProfileBase):
    id: UUID
    user_id: UUID
    
    class Config:
        from_attributes = True

class WorkExperienceBase(BaseModel):
    company_name: str
    position: str
    location: str
    start_date: datetime
    end_date: Optional[datetime] = None
    description: str = Field(...)

class WorkExperienceCreate(WorkExperienceBase):
    pass

class WorkExperience(WorkExperienceBase):
    id: UUID
    profile_id: UUID

    class Config:
        from_attributes = True