# schemas/resume.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class ResumeBase(BaseModel):
    content: str
    template_id: Optional[UUID] = None

class ResumeCreate(ResumeBase):
    pass

class Resume(ResumeBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Add back these classes that were missing
class LatexCompileRequest(BaseModel):
    content: str

class CompileResponse(BaseModel):
    message: str