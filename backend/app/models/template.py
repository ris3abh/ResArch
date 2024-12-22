from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import BaseModel

class PredefinedTemplate(BaseModel):
    __tablename__ = "predefined_templates"
    
    name = Column(String, nullable=False)
    description = Column(String)
    content = Column(Text, nullable=False)  # LaTeX content
    preview_image = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Template(BaseModel):
    __tablename__ = "templates"
    
    name = Column(String, nullable=False)
    description = Column(String)
    content = Column(Text, nullable=False)  # LaTeX content
    user_id = Column(Integer, ForeignKey('user.id'))
    predefined_template_id = Column(Integer, ForeignKey('predefined_templates.id'), nullable=True)
    
    # Fields for file storage URLs and paths
    tex_url = Column(String, nullable=True)  # Cloudinary URL for .tex
    pdf_url = Column(String, nullable=True)  # Cloudinary URL for .pdf
    pdf_path = Column(String, nullable=True)  # Local temp path for .pdf
    unique_id = Column(String, nullable=True)  # Unique identifier for temp files
    
    # New fields for template status
    is_finalized = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="templates")
    base_template = relationship("PredefinedTemplate")