# app/core/init_db.py
import json
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.template import PredefinedTemplate
from app.models.skills import Skill, SkillCategory
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

async def load_skills_data() -> Dict[str, List[Dict]]:
    """Load skills data from JSON files."""
    data_dir = Path('app/data')
    skills_data = {}
    
    try:
        with open(data_dir / 'techstack.json', 'r') as f:
            skills_data['tech'] = json.load(f)
        with open(data_dir / 'softskills.json', 'r') as f:
            skills_data['soft'] = json.load(f)
        with open(data_dir / 'hardskills.json', 'r') as f:
            skills_data['hard'] = json.load(f)
        return skills_data
    except FileNotFoundError as e:
        logger.error(f"Error loading skills data: {e}")
        return None

async def init_skills(db: Session):
    """Initialize skills database with predefined skills"""
    skills_data = await load_skills_data()
    if not skills_data:
        logger.error("Failed to load skills data")
        return

    category_mapping = {
        'tech': SkillCategory.TECHNICAL,
        'soft': SkillCategory.SOFT,
        'hard': SkillCategory.HARD
    }

    try:
        added_skills = set()  # Keep track of skills we've already processed
        
        for category, skills in skills_data.items():
            for skill_data in skills:
                # Handle different JSON structures
                skill_name = skill_data.get('technology') or skill_data.get('skill')
                if not skill_name:
                    continue
                
                # Normalize skill name
                normalized_name = skill_name.strip().lower()
                
                # Skip if we've already processed this skill
                if normalized_name in added_skills:
                    continue
                
                # Check if skill already exists in database
                existing_skill = db.query(Skill).filter(
                    Skill.name.ilike(normalized_name)
                ).first()

                if not existing_skill:
                    try:
                        skill = Skill(
                            name=skill_name,
                            category=category_mapping[category],
                            source="SEED"
                        )
                        db.add(skill)
                        db.flush()  # Try to flush each skill individually
                        added_skills.add(normalized_name)
                    except Exception as e:
                        logger.warning(f"Skipping duplicate skill {skill_name}: {str(e)}")
                        db.rollback()  # Rollback just this skill
                        continue

        db.commit()
        logger.info(f"Successfully seeded {len(added_skills)} skills to database")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding skills: {e}")

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

async def init_db(db: Session):
    """Initialize all database components"""
    await init_predefined_templates(db)
    await init_skills(db)