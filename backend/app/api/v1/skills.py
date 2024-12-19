from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.skills import Skill, UserSkill, SkillCategory
from app.models.user import User
from app.schemas.skills import (
    SkillCreate,
    Skill as SkillSchema,
    UserSkillCreate,
    UserSkill as UserSkillSchema
)

router = APIRouter()

@router.post("/", response_model=SkillSchema)
async def create_skill(
    skill: SkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if skill already exists
    db_skill = db.query(Skill).filter(Skill.name == skill.name).first()
    if db_skill:
        return db_skill
    
    # Create new skill
    db_skill = Skill(
        name=skill.name,
        category=skill.category,
        description=skill.description
    )
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.post("/user-skill", response_model=UserSkillSchema)
async def add_user_skill(
    user_skill: UserSkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if skill exists
    skill = db.query(Skill).filter(Skill.id == user_skill.skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    # Check if user already has this skill
    existing_skill = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_id == skill.id
    ).first()
    
    if existing_skill:
        # Update proficiency if skill already exists
        existing_skill.proficiency_level = user_skill.proficiency_level
        db.commit()
        db.refresh(existing_skill)
        return existing_skill
    
    # Add new user skill
    db_user_skill = UserSkill(
        user_id=current_user.id,
        skill_id=skill.id,
        proficiency_level=user_skill.proficiency_level
    )
    db.add(db_user_skill)
    db.commit()
    db.refresh(db_user_skill)
    return db_user_skill

@router.get("/my-skills", response_model=List[UserSkillSchema])
async def get_user_skills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()

@router.get("/categories")
async def get_skill_categories():
    return [category.value for category in SkillCategory]

@router.get("/{skill_id}", response_model=SkillSchema)
async def get_skill(
    skill_id: int,
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    return skill

@router.delete("/user-skill/{skill_id}")
async def remove_user_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    user_skill = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_id == skill_id
    ).first()
    
    if not user_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found for this user"
        )
    
    db.delete(user_skill)
    db.commit()
    return {"message": "Skill removed successfully"}