# app/core/init_db.py
import os
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.template import PredefinedTemplate

async def init_predefined_templates(db: Session):
    """Initialize predefined templates from data/resume folder"""
    resume_dir = Path('app/data/resumes')
    
    # Get all .tex files
    tex_files = list(resume_dir.glob('*.tex'))
    
    for tex_file in tex_files:
        # Get corresponding .png file
        png_file = tex_file.with_suffix('.png')
        template_name = tex_file.stem
        
        # Read template content
        with open(tex_file, 'r') as f:
            content = f.read()
            
        # Check if template already exists
        existing = db.query(PredefinedTemplate).filter(
            PredefinedTemplate.name == template_name
        ).first()
        
        if not existing:
            # Create new template
            template = PredefinedTemplate(
                name=template_name,
                description=f"Template: {template_name}",
                content=content,
                preview_image=str(png_file) if png_file.exists() else None
            )
            db.add(template)
    
    db.commit()