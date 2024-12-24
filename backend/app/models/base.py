# models/base.py
from datetime import datetime
from sqlalchemy import Column, DateTime
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.types import TypeDecorator, String
from uuid import uuid4, UUID
from app.core.database import Base

class SQLiteUUID(TypeDecorator):
    """Custom UUID type for SQLite"""
    impl = String
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        # Handle both string and UUID objects
        if isinstance(value, str):
            return str(UUID(value))  # Validate and convert to string
        if isinstance(value, UUID):
            return str(value)
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        try:
            return UUID(value)
        except (TypeError, ValueError):
            return value

class BaseModel(Base):
    __abstract__ = True

    id = Column(SQLiteUUID(), primary_key=True, default=uuid4)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()