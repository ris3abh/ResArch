from fastapi import APIRouter, Depends, HTTPException, Query, Body, File, UploadFile
import shutil
import tempfile
from sqlalchemy.orm import Session
from groq import Groq
from typing import List, Optional
from app.models.skills import Skill as SkillModel
from app.models.skills import UserSkill, SkillCategory
from app.schemas.skills import (
    SkillCreate,
    Skill as SkillSchema,
    UserSkillCreate,
    UserSkill as UserSkillSchema,
    BatchSkillsByCategory,
    SingleSkillCreate
)
from app.core.auth import get_current_active_user
from app.core.GPTskillextraction_utils import extract_resume_content, llama_extract_skills_groq
# from app.core.skill_categorization import infer_skill_category
from app.core.database import get_db
from app.models.user import User
import os
from app.core.config import settings

router = APIRouter()

# Initialize Groq client at module level
groq_client = Groq(api_key=settings.GROQ_API_KEY)
MODEL_NAME = "llama3-8b-8192"

@router.get("/skills", response_model=List[SkillSchema])
async def search_skills(
    query: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Search for skills."""
    if query:
        return db.query(SkillModel).filter(SkillModel.name.ilike(f"%{query}%")).all()
    return db.query(SkillModel).all()

@router.post("/skills/extract", response_model=List[SkillSchema])
async def extract_skills(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Upload a PDF or .tex file, extract resume content, and identify categorized skills.
    """
    try:
        # 1. Save uploaded file to a temp directory
        with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename) as tmp:
            shutil.copyfileobj(file.file, tmp)
            temp_path = tmp.name

        # 2. Determine file type from extension
        file_ext = file.filename.lower()
        if file_ext.endswith(".pdf"):
            file_type = "pdf"
        elif file_ext.endswith(".tex"):
            file_type = "tex"
        else:
            raise HTTPException(
                status_code=400, detail="Unsupported file type. Please upload a PDF or .tex file."
            )

        # 3. Extract the resume text
        resume_text = extract_resume_content(temp_path, file_type=file_type)
        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="No content found in the resume.")

        # 4. Extract skills using Groq + Llama
        categorized_skills = llama_extract_skills_groq(resume_text, groq_client, MODEL_NAME)
        if not categorized_skills:
            raise HTTPException(
                status_code=400,
                detail="No skills could be extracted from the provided resume."
            )

        # 5. Save the recognized skills to DB if they are new
        saved_skills = []
        for skill_name, category in categorized_skills:
            # Skip empty or invalid skills
            if not skill_name or len(skill_name) < 2:
                continue

            # Check for existing skill
            skill = db.query(SkillModel).filter(
                SkillModel.name.ilike(skill_name)
            ).first()

            if not skill:
                skill = SkillModel(
                    name=skill_name.strip(),
                    category=category,
                    source="GPT"
                )
                db.add(skill)
                try:
                    db.commit()
                    db.refresh(skill)
                except Exception:
                    db.rollback()
                    # Skip if error
                    continue

            saved_skills.append(skill)

        return saved_skills

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing skills: {str(e)}"
        )

@router.post("/user-skills", response_model=UserSkillSchema)
async def add_user_skill(
    user_skill: UserSkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add a skill for the current user."""
    db_skill = db.query(SkillModel).filter(SkillModel.id == user_skill.skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    db_user_skill = UserSkill(
        user_id=current_user.id,
        skill_id=user_skill.skill_id,
        rating=user_skill.rating
    )
    db.add(db_user_skill)
    db.commit()
    db.refresh(db_user_skill)
    return db_user_skill

@router.post("/user-skills/batch", response_model=List[UserSkillSchema])
async def add_user_skills_batch(
    skills: BatchSkillsByCategory,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add multiple skills for the current user, organized by category."""
    try:
        saved_skills = []

        # Process each category
        categories_map = {
            'hard_skills': SkillCategory.HARD,
            'soft_skills': SkillCategory.SOFT,
            'technical_skills': SkillCategory.TECHNICAL
        }

        for category_key, category_enum in categories_map.items():
            skills_list = getattr(skills, category_key)
            for skill_data in skills_list:
                # Check if skill exists
                db_skill = db.query(SkillModel).filter(
                    SkillModel.name.ilike(skill_data.name)
                ).first()

                # Create skill if it doesn't exist
                if not db_skill:
                    db_skill = SkillModel(
                        name=skill_data.name,
                        category=category_enum,
                        source="USER"
                    )
                    db.add(db_skill)
                    db.flush()  # Get ID without committing

                # Create or update user skill
                db_user_skill = db.query(UserSkill).filter(
                    UserSkill.user_id == current_user.id,
                    UserSkill.skill_id == db_skill.id
                ).first()

                if db_user_skill:
                    db_user_skill.rating = skill_data.rating
                else:
                    db_user_skill = UserSkill(
                        user_id=current_user.id,
                        skill_id=db_skill.id,
                        rating=skill_data.rating
                    )
                    db.add(db_user_skill)

                saved_skills.append(db_user_skill)

        db.commit()
        for skill in saved_skills:
            db.refresh(skill)

        return saved_skills

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error saving skills batch: {str(e)}"
        )
    
@router.post("/user-skills/single", response_model=UserSkillSchema)
async def add_single_user_skill(
    skill_data: SingleSkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add a single skill with category for the current user."""
    try:
        # Check if skill exists
        db_skill = db.query(SkillModel).filter(
            SkillModel.name.ilike(skill_data.name)
        ).first()

        # Create skill if it doesn't exist
        if not db_skill:
            db_skill = SkillModel(
                name=skill_data.name,
                category=skill_data.category,
                source="USER"
            )
            db.add(db_skill)
            db.flush()

        # Create or update user skill
        db_user_skill = db.query(UserSkill).filter(
            UserSkill.user_id == current_user.id,
            UserSkill.skill_id == db_skill.id
        ).first()

        if db_user_skill:
            db_user_skill.rating = skill_data.rating
        else:
            db_user_skill = UserSkill(
                user_id=current_user.id,
                skill_id=db_skill.id,
                rating=skill_data.rating
            )
            db.add(db_user_skill)

        db.commit()
        db.refresh(db_user_skill)
        return db_user_skill

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error saving skill: {str(e)}"
        )
    
@router.get("/user-skills/me", response_model=List[UserSkillSchema])
async def get_my_skills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all skills for the current user."""
    return db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()