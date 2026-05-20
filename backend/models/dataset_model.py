from __future__ import annotations

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from core.database import Base


class Dataset(Base):
    __tablename__ = 'datasets'

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=True)
    dataset_name = Column(String(256), nullable=False, index=True)
    file_path = Column(String(1024), nullable=False)
    version = Column(String(128), nullable=True)
    status = Column(String(64), nullable=True)
    owner_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {'id': self.id, 'dataset_name': self.dataset_name, 'file_path': self.file_path, 'version': self.version, 'status': self.status, 'owner_id': self.owner_id}
