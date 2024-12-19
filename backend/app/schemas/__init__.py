from .user import User, UserCreate, UserUpdate, UserInDB
from .skills import Skill, SkillCreate, UserSkill, UserSkillCreate
from .template import Template, TemplateCreate
from .resume import Resume, ResumeCreate

# For easy importing
__all__ = [
    'User', 'UserCreate', 'UserUpdate', 'UserInDB',
    'Skill', 'SkillCreate', 'UserSkill', 'UserSkillCreate',
    'Template', 'TemplateCreate',
    'Resume', 'ResumeCreate',
]