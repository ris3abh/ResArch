from sqlalchemy import Column, String, ForeignKey, Text, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
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
    user_id = Column(UUID(as_uuid=True), ForeignKey('user.id'))
    predefined_template_id = Column(UUID(as_uuid=True), ForeignKey('predefined_templates.id'), nullable=True)
    
    # Fields for file storage URLs and paths
    tex_url = Column(String, nullable=True)
    pdf_url = Column(String, nullable=True)
    pdf_path = Column(String, nullable=True)
    unique_id = Column(String, nullable=True)
    
    is_finalized = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="templates")
    base_template = relationship("PredefinedTemplate")