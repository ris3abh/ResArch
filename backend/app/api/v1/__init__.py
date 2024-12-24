from fastapi import APIRouter
from . import auth, users, skills, templates, resumes, profile  # Add profile

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(skills.router, prefix="/skills", tags=["skills"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["resumes"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])  # Add this line