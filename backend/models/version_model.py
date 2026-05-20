from __future__ import annotations

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from core.database import Base


class Version(Base):
    __tablename__ = 'versions'

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey('datasets.id'), nullable=False)
    version_name = Column(String(256), nullable=False, index=True)
    stage = Column(String(128), nullable=True)
    file_path = Column(String(1024), nullable=False)
    checksum = Column(String(256), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {'id': self.id, 'dataset_id': self.dataset_id, 'version_name': self.version_name, 'stage': self.stage, 'file_path': self.file_path, 'checksum': self.checksum}
