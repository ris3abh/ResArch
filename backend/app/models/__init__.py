from .base import BaseModel, Base
from .user import User
from .skills import Skill, UserSkill, SkillCategory
from .template import Template
from .resume import Resume
from .profile import UserProfile, WorkExperience  # Add this

# For easy importing
__all__ = [
    'Base',
    'BaseModel',
    'User',
    'Skill',
    'UserSkill',
    'SkillCategory',
    'Template',
    'Resume',
    'UserProfile',  # Add this
    'WorkExperience'  # Add this
]