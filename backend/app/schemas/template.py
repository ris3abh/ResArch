from pydantic import BaseModel
from .base import BaseSchema

class TemplateBase(BaseModel):
    name: str
    description: str | None = None
    content: str

class TemplateCreate(TemplateBase):
    user_id: int

class Template(TemplateBase, BaseSchema):
    user_id: int