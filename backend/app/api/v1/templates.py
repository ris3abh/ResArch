from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import os
import uuid
import tempfile
from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.template import Template, PredefinedTemplate
from app.models.user import User
from app.schemas.template import (
    TemplateCreate, 
    Template as TemplateSchema,
    PredefinedTemplate as PredefinedTemplateSchema
)
from app.utils.pdf import convert_latex_to_pdf
from app.core.cloudinary_utils import upload_file_to_cloudinary, delete_resource_from_cloudinary


class MessageResponse(BaseModel):
    message: str

router = APIRouter()

# New endpoint: List predefined templates
@router.get("/predefined", response_model=List[PredefinedTemplateSchema])
async def list_predefined_templates(
    db: Session = Depends(get_db)
):
    """Get all predefined templates"""
    return db.query(PredefinedTemplate).all()

@router.get("/predefined/{template_id}", response_model=PredefinedTemplateSchema)
async def get_predefined_template(
    template_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific predefined template"""
    template = db.query(PredefinedTemplate).filter(PredefinedTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

# New endpoint: Select predefined template
@router.post("/select/{template_id}", response_model=TemplateSchema)
async def select_predefined_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if predefined template exists
    predefined = db.query(PredefinedTemplate).filter(PredefinedTemplate.id == template_id).first()
    if not predefined:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Check if user already has a template
    existing = db.query(Template).filter(Template.user_id == current_user.id).first()
    if existing:
        # Update existing template
        existing.content = predefined.content
        existing.name = f"{predefined.name} - Modified"
        existing.predefined_template_id = template_id
        # Reset URLs and paths since this is a new version
        existing.tex_url = None
        existing.pdf_url = None
        existing.pdf_path = None
        existing.unique_id = None
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new template
    new_template = Template(
        user_id=current_user.id,
        name=f"{predefined.name} - Modified",
        description=predefined.description,
        content=predefined.content,
        predefined_template_id=template_id
    )
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    return new_template

# 1️⃣ Create a Template
@router.post("/", response_model=TemplateSchema)
async def create_template(
    template: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_template = db.query(Template).filter(Template.user_id == current_user.id).first()
    if db_template:
        raise HTTPException(status_code=400, detail="A template already exists for this user. Please update or replace it.")

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


# 2️⃣ Get User's Template
@router.get("/my-template", response_model=TemplateSchema)
async def get_user_template(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    template = db.query(Template).filter(Template.user_id == current_user.id).first()
    if not template:
        raise HTTPException(status_code=404, detail="No template found for this user.")
    return template


# 3️⃣ Upload Template (Convert LaTeX to PDF)
@router.post("/upload", response_model=TemplateSchema)
async def upload_template(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Step 1: Read LaTeX file content
    content = await file.read()
    template_content = content.decode()

    # Step 2: Check if user already has a template
    db_template = db.query(Template).filter(Template.user_id == current_user.id).first()
    if db_template:
        # Update existing template
        db_template.name = file.filename
        db_template.description = f"Uploaded template: {file.filename}"
        db_template.content = template_content
    else:
        # Create a new template
        db_template = Template(
            name=file.filename,
            description=f"Uploaded template: {file.filename}",
            content=template_content,
            user_id=current_user.id
        )
        db.add(db_template)

    db.commit()
    db.refresh(db_template)

    # Step 3: Generate a unique filename
    unique_id = str(uuid.uuid4())
    tex_filename = f"{unique_id}.tex"
    pdf_filename = f"{unique_id}.pdf"
    temp_dir = tempfile.gettempdir()
    tex_path = os.path.join(temp_dir, tex_filename)

    # Step 4: Write tex content to file
    with open(tex_path, "w") as f:
        f.write(template_content)

    # Step 5: Convert LaTeX to PDF
    try:
        pdf_path = convert_latex_to_pdf(latex_filepath=tex_path, output_directory=temp_dir)
        db_template.pdf_path = pdf_path  # Store pdf_path in the DB
        db_template.unique_id = unique_id  # Optional: store unique_id in DB
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

    # Step 6: Save the pdf_path and unique_id to the database
    db.commit()
    db.refresh(db_template)

    return db_template


# 4️⃣ Preview PDF
@router.get("/preview")
async def preview_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    template = db.query(Template).filter(Template.user_id == current_user.id).first()
    if not template or not template.pdf_path:
        raise HTTPException(status_code=404, detail="PDF not found for preview.")
    if not os.path.isfile(template.pdf_path):
        raise HTTPException(status_code=404, detail="PDF file not found on disk.")
    return FileResponse(template.pdf_path, media_type='application/pdf')


# 5️⃣ Finalize Template (Upload to Cloudinary)
@router.post("/finalize", response_model=TemplateSchema)
async def finalize_template(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Step 1: Get the user's template
    db_template = db.query(Template).filter(Template.user_id == current_user.id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="No template found to finalize.")
    
    pdf_path = db_template.pdf_path
    tex_path = os.path.join(tempfile.gettempdir(), f"{db_template.unique_id}.tex")

    if not os.path.isfile(pdf_path):
        raise HTTPException(status_code=404, detail="PDF file does not exist.")

    try:
        # Upload the TEX file to Cloudinary
        tex_url = upload_file_to_cloudinary(tex_path, public_id=f"{current_user.id}_template_{db_template.id}_tex")
        
        # Upload the PDF file to Cloudinary
        pdf_url = upload_file_to_cloudinary(pdf_path, public_id=f"{current_user.id}_template_{db_template.id}_pdf")
        
        # Update the template with these URLs
        db_template.tex_url = tex_url
        db_template.pdf_url = pdf_url
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload files to Cloudinary: {str(e)}")

    # Update database
    db.commit()
    db.refresh(db_template)

    # Clean up temp files (optional)
    if os.path.exists(pdf_path):
        os.remove(pdf_path)
    if os.path.exists(tex_path):
        os.remove(tex_path)

    return db_template


# 6️⃣ Delete Template
@router.delete("/")
async def delete_template(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_template = db.query(Template).filter(Template.user_id == current_user.id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="No template found.")

    db.delete(db_template)
    db.commit()
    return {"message": "Template and associated files deleted successfully"}

# Delete from Cloudinary
@router.delete("/{template_id}", response_model=MessageResponse)
async def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Step 1: Get the template from the database
    db_template = db.query(Template).filter(Template.id == template_id, Template.user_id == current_user.id).first()
    if not db_template:
        raise HTTPException(status_code=404, detail="No template found.")

    # Step 2: Remove the files from Cloudinary if they exist
    try:
        if db_template.pdf_url:
            delete_resource_from_cloudinary(db_template.pdf_url)
        if db_template.tex_url:
            delete_resource_from_cloudinary(db_template.tex_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete files from Cloudinary: {str(e)}")

    # Step 3: Delete the template from the database
    db.delete(db_template)
    db.commit()
    
    # Step 4: Return a success message
    return {"message": "Template and associated files deleted successfully"}


# 7️⃣ Get Finalized Resources
@router.get("/finalized-resources", response_model=TemplateSchema)
async def get_finalized_resources(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    db_template = db.query(Template).filter(Template.user_id == current_user.id).first()
    if not db_template or not db_template.pdf_url or not db_template.tex_url:
        raise HTTPException(status_code=400, detail="Template not finalized yet.")
    return db_template