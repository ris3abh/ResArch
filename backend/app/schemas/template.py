from pydantic import BaseModel
from typing import Optional
from .base import BaseSchema
from datetime import datetime

# Keep existing schemas
class TemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    content: str

class TemplateCreate(TemplateBase):
    pass

class Template(BaseSchema, TemplateBase):
    user_id: int
    tex_url: Optional[str] = None  # Cloudinary URL for .tex
    pdf_url: Optional[str] = None  # Cloudinary URL for .pdf
    pdf_path: Optional[str] = None  # Local temp path for .pdf
    unique_id: Optional[str] = None  # Unique identifier for temp files
    predefined_template_id: Optional[int] = None
    is_finalized: bool = False
    updated_at: Optional[datetime] = None

# Add new schemas for predefined templates
class PredefinedTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    content: str
    preview_image: Optional[str] = None

class PredefinedTemplateCreate(PredefinedTemplateBase):
    pass

class PredefinedTemplate(BaseSchema, PredefinedTemplateBase):
    created_at: datetime

# Add schema for template updates
class TemplateUpdate(BaseModel):
    content: str

class TemplateSelect(BaseModel):
    template_id: int