from __future__ import annotations

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from core.database import Base


class Project(Base):
    __tablename__ = 'projects'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(256), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'description': self.description, 'owner_id': self.owner_id}
