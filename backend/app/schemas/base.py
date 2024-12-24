# schemas/base.py
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class BaseSchema(BaseModel):
    id: UUID | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True