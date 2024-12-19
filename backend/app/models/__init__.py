from .base import BaseModel, Base  # Add Base here
from .user import User
from .skills import Skill, UserSkill, SkillCategory
from .template import Template
from .resume import Resume

# For easy importing
__all__ = [
    'Base',        # Add Base here
    'BaseModel',
    'User',
    'Skill',
    'UserSkill',
    'SkillCategory',
    'Template',
    'Resume'
]