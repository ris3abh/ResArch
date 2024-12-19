from pydantic import BaseModel
from datetime import datetime

class BaseSchema(BaseModel):
    id: int | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True