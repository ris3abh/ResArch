from sqlalchemy import Column, String, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import BaseModel

class Resume(BaseModel):
    title = Column(String, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user.id'))
    template_id = Column(UUID(as_uuid=True), ForeignKey('templates.id'))
    content = Column(Text)  # Final LaTeX content
    resume_metadata = Column(JSON)  # Changed from 'metadata' to 'resume_metadata'
    
    user = relationship("User", backref="resumes")
    template = relationship("Template")