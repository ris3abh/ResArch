from pydantic import BaseModel
from typing import Dict, Any
from .base import BaseSchema

class ResumeBase(BaseModel):
    title: str
    content: str | None = None
    resume_metadata: Dict[str, Any] | None = None

class ResumeCreate(ResumeBase):
    user_id: int
    template_id: int

class Resume(ResumeBase, BaseSchema):
    user_id: int
    template_id: int