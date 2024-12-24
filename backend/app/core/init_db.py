# app/core/init_db.py
import json
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.template import PredefinedTemplate
from app.models.skills import Skill, SkillCategory
from typing import Dict, List
import logging
from uuid import uuid4

logger = logging.getLogger(__name__)

async def load_skills_data() -> Dict[str, List[Dict]]:
    """Load skills data from JSON files."""
    data_dir = Path('app/data')
    skills_data = {}
    
    try:
        logger.info("Starting to load skills data files")
        with open(data_dir / 'techstack.json', 'r') as f:
            skills_data['tech'] = json.load(f)
            logger.info(f"Loaded {len(skills_data['tech'])} tech skills")
        with open(data_dir / 'softskills.json', 'r') as f:
            skills_data['soft'] = json.load(f)
            logger.info(f"Loaded {len(skills_data['soft'])} soft skills")
        with open(data_dir / 'hardskills.json', 'r') as f:
            skills_data['hard'] = json.load(f)
            logger.info(f"Loaded {len(skills_data['hard'])} hard skills")
        return skills_data
    except FileNotFoundError as e:
        logger.error(f"Error loading skills data: {e}")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing JSON data: {e}")
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
            logger.info(f"Processing {category} skills, total count: {len(skills)}")
            
            # Log first skill in each category to debug data structure
            if skills:
                logger.info(f"Sample {category} skill data: {skills[0]}")
            
            for index, skill_data in enumerate(skills):
                try:
                    # Log raw skill data
                    logger.info(f"Processing {category} skill {index + 1}/{len(skills)}: {skill_data}")
                    
                    # Try both possible keys and log what we find
                    tech_name = skill_data.get('technology')
                    skill_name = skill_data.get('skill')
                    logger.info(f"Found technology: {tech_name}, skill: {skill_name}")
                    
                    final_name = tech_name or skill_name
                    if not final_name:
                        logger.warning(f"No valid name found in skill data: {skill_data}")
                        continue
                    
                    # Normalize skill name
                    normalized_name = final_name.strip().lower()
                    logger.info(f"Normalized name: {normalized_name}")
                    
                    # Skip if we've already processed this skill
                    if normalized_name in added_skills:
                        logger.info(f"Skipping duplicate skill: {normalized_name}")
                        continue
                    
                    # Check if skill already exists in database
                    existing_skill = db.query(Skill).filter(
                        Skill.name.ilike(normalized_name)
                    ).first()

                    if existing_skill:
                        logger.info(f"Skill already exists: {normalized_name}")
                        continue

                    # Create new skill
                    new_skill = Skill(
                        id=uuid4(),
                        name=final_name,
                        category=category_mapping[category],
                        source="SEED"
                    )
                    
                    logger.info(f"Adding new skill: {final_name} ({category})")
                    db.add(new_skill)
                    added_skills.add(normalized_name)

                except Exception as e:
                    logger.error(f"Error processing skill: {str(e)}", exc_info=True)
                    continue

            try:
                logger.info(f"Flushing {category} skills...")
                db.flush()
                logger.info(f"Successfully flushed {category} skills")
            except Exception as e:
                logger.error(f"Error flushing {category} skills: {str(e)}", exc_info=True)
                db.rollback()

        try:
            logger.info(f"Committing {len(added_skills)} skills to database...")
            db.commit()
            logger.info(f"Successfully committed {len(added_skills)} skills")
        except Exception as e:
            logger.error(f"Error during final commit: {str(e)}", exc_info=True)
            db.rollback()
            raise

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding skills: {e}", exc_info=True)
        raise

    return len(added_skills)

async def init_predefined_templates(db: Session):
    """Initialize predefined templates from data/resume folder"""
    resume_dir = Path('app/data/resumes')
    
    try:
        # Get all .tex files
        tex_files = list(resume_dir.glob('*.tex'))
        logger.info(f"Found {len(tex_files)} template files")
        
        for tex_file in tex_files:
            try:
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
                    # Create new template with explicit UUID
                    template = PredefinedTemplate(
                        id=uuid4(),
                        name=template_name,
                        description=f"Template: {template_name}",
                        content=content,
                        preview_image=str(png_file) if png_file.exists() else None
                    )
                    db.add(template)
                    logger.debug(f"Added template: {template_name}")
            except Exception as e:
                logger.error(f"Error processing template {tex_file}: {str(e)}")
                continue
        
        db.commit()
        logger.info("Successfully initialized predefined templates")
    except Exception as e:
        db.rollback()
        logger.error(f"Error initializing predefined templates: {e}")
        raise

async def init_db(db: Session):
    """Initialize all database components"""
    try:
        await init_predefined_templates(db)
        await init_skills(db)
        logger.info("Database initialization completed successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise