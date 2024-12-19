from typing import List
from pydantic import AnyHttpUrl
from .settings import settings

PROJECT_NAME = settings.PROJECT_NAME
VERSION = settings.VERSION
API_V1_STR = settings.API_V1_STR

# CORS Configuration
BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
    "http://localhost:3000",  # React frontend
    "http://localhost:8000",  # FastAPI backend
]

# API Configuration
API_TITLE = f"{PROJECT_NAME} API"
API_DESCRIPTION = """
Resume Architect API provides endpoints for:
- Resume parsing and generation
- Skill matching with job descriptions
- LaTeX template management
- GitHub project analysis
- Resume optimization using AI

This API powers the Resume Architect application, helping users create tailored resumes automatically.
"""