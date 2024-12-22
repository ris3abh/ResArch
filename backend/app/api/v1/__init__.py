# api/v1/__init__.py
from fastapi import APIRouter
from . import auth, users, skills, templates, resumes

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(skills.router, prefix="/skills", tags=["skills"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["resumes"])