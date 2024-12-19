from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import json

from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.template import Template
from app.models.user import User
from app.schemas.template import TemplateCreate, Template as TemplateSchema

router = APIRouter()

@router.post("/", response_model=TemplateSchema)
async def create_template(
    template: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_template = Template(
        name=template.name,
        description=template.description,
        content=template.content,
        user_id=current_user.id
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@router.get("/my-templates", response_model=List[TemplateSchema])
async def get_user_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return db.query(Template).filter(Template.user_id == current_user.id).all()

@router.get("/{template_id}", response_model=TemplateSchema)
async def get_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    template = db.query(Template).filter(
        Template.id == template_id,
        Template.user_id == current_user.id
    ).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    return template

@router.put("/{template_id}", response_model=TemplateSchema)
async def update_template(
    template_id: int,
    template_data: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    template = db.query(Template).filter(
        Template.id == template_id,
        Template.user_id == current_user.id
    ).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    for field, value in template_data.dict().items():
        setattr(template, field, value)
    
    db.add(template)
    db.commit()
    db.refresh(template)
    return template

@router.delete("/{template_id}")
async def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    template = db.query(Template).filter(
        Template.id == template_id,
        Template.user_id == current_user.id
    ).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    db.delete(template)
    db.commit()
    return {"message": "Template deleted successfully"}

@router.post("/upload")
async def upload_template(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Read the LaTeX file content
    content = await file.read()
    template_content = content.decode()
    
    # Create template from uploaded file
    db_template = Template(
        name=file.filename,
        description=f"Uploaded template: {file.filename}",
        content=template_content,
        user_id=current_user.id
    )
    
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return {"message": "Template uploaded successfully", "template_id": db_template.id}