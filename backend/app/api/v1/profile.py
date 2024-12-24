from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.user import User
from app.models.profile import UserProfile, WorkExperience, ProfileType
from app.schemas.profile import (
    UserProfileCreate, 
    UserProfile as UserProfileSchema,
    WorkExperienceCreate,
    WorkExperience as WorkExperienceSchema
)
from uuid import UUID, uuid4
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/profile/setting", response_model=UserProfileSchema)
async def create_or_update_profile_setting(
    profile: UserProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create or update user profile setting (Academic/Professional)"""
    db_profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()
    
    if db_profile:
        for key, value in profile.dict().items():
            setattr(db_profile, key, value)
    else:
        db_profile = UserProfile(
            id=uuid4(),
            user_id=current_user.id, 
            **profile.dict()
        )
        db.add(db_profile)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.post("/profile/experience", response_model=WorkExperienceSchema)
async def add_work_experience(
    experience: WorkExperienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add a new work experience entry"""
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        # Create profile if it doesn't exist
        profile = UserProfile(
            id=uuid4(),
            user_id=current_user.id,
            profile_type=ProfileType.PROFESSIONAL  # Default to professional
        )
        db.add(profile)
        db.flush()
    
    db_experience = WorkExperience(
        id=uuid4(),
        profile_id=profile.id,
        **experience.dict()
    )
    db.add(db_experience)
    db.commit()
    db.refresh(db_experience)
    
    return db_experience

@router.post("/profile/experiences/bulk", response_model=List[WorkExperienceSchema])
async def add_work_experiences_bulk(
    experiences: List[WorkExperienceCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Add multiple work experiences at once"""
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        profile = UserProfile(
            id=uuid4(),
            user_id=current_user.id,
            profile_type=ProfileType.PROFESSIONAL
        )
        db.add(profile)
        db.flush()
    
    created_experiences = []
    for exp in experiences:
        db_experience = WorkExperience(
            id=uuid4(),
            profile_id=profile.id,
            **exp.dict()
        )
        db.add(db_experience)
        created_experiences.append(db_experience)
    
    db.commit()
    for exp in created_experiences:
        db.refresh(exp)
    
    return created_experiences

@router.get("/profile/experiences", response_model=List[WorkExperienceSchema])
async def get_work_experiences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all work experiences for current user"""
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    experiences = db.query(WorkExperience)\
        .filter(WorkExperience.profile_id == profile.id)\
        .order_by(WorkExperience.start_date.desc())\
        .all()
        
    return experiences

@router.get("/profile/experience/{experience_id}", response_model=WorkExperienceSchema)
async def get_work_experience(
    experience_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific work experience entry"""
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    experience = db.query(WorkExperience).filter(
        WorkExperience.id == experience_id,
        WorkExperience.profile_id == profile.id
    ).first()
    
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
        
    return experience

@router.put("/profile/experience/{experience_id}", response_model=WorkExperienceSchema)
async def update_work_experience(
    experience_id: UUID,
    experience_update: WorkExperienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a work experience entry"""
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    experience = db.query(WorkExperience).filter(
        WorkExperience.id == experience_id,
        WorkExperience.profile_id == profile.id
    ).first()
    
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
    
    for key, value in experience_update.dict().items():
        setattr(experience, key, value)
    
    db.commit()
    db.refresh(experience)
    return experience

@router.delete("/profile/experience/{experience_id}")
async def delete_work_experience(
    experience_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a work experience entry"""
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    experience = db.query(WorkExperience).filter(
        WorkExperience.id == experience_id,
        WorkExperience.profile_id == profile.id
    ).first()
    
    if not experience:
        raise HTTPException(status_code=404, detail="Experience not found")
        
    db.delete(experience)
    db.commit()
    
    return {"message": "Experience deleted successfully"}