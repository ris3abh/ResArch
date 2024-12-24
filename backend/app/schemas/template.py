# schemas/template.py
from pydantic import BaseModel
from typing import Optional
from .base import BaseSchema
from datetime import datetime
from uuid import UUID

class TemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    content: str

class TemplateCreate(TemplateBase):
    pass

class Template(BaseSchema, TemplateBase):
    user_id: UUID
    tex_url: Optional[str] = None
    pdf_url: Optional[str] = None
    pdf_path: Optional[str] = None
    unique_id: Optional[str] = None
    predefined_template_id: Optional[UUID] = None
    is_finalized: bool = False
    updated_at: Optional[datetime] = None

class PredefinedTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    content: str
    preview_image: Optional[str] = None

class PredefinedTemplateCreate(PredefinedTemplateBase):
    pass

class PredefinedTemplate(BaseSchema, PredefinedTemplateBase):
    created_at: datetime

class TemplateUpdate(BaseModel):
    content: str

class TemplateSelect(BaseModel):
    template_id: UUID