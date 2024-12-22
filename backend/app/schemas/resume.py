# schemas/resume.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResumeBase(BaseModel):
    content: str
    template_id: Optional[str] = None

class ResumeCreate(ResumeBase):
    pass

class Resume(ResumeBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class LatexCompileRequest(BaseModel):
    content: str

class CompileResponse(BaseModel):
    message: str