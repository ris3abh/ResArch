from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from .base import BaseModel

class Template(BaseModel):
    name = Column(String, nullable=False)
    description = Column(String)
    content = Column(Text, nullable=False)  # LaTeX content
    user_id = Column(Integer, ForeignKey('user.id'))
    
    user = relationship("User", backref="templates")