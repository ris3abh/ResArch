# schemas/user.py
from pydantic import BaseModel, EmailStr
from .base import BaseSchema
from uuid import UUID

class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    github_username: str | None = None

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: str | None = None

class UserInDB(UserBase, BaseSchema):
    is_active: bool = True

class User(UserInDB):
    pass