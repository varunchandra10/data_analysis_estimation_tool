from __future__ import annotations

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from core.database import Base


class AICacheRef(Base):
    __tablename__ = 'ai_cache_refs'

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey('datasets.id'), nullable=False)
    version_id = Column(Integer, ForeignKey('versions.id'), nullable=True)
    cache_type = Column(String(128), nullable=False)
    cache_path = Column(String(1024), nullable=False)
    checksum = Column(String(256), nullable=True)
    invalidated = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'dataset_id': self.dataset_id,
            'version_id': self.version_id,
            'cache_type': self.cache_type,
            'cache_path': self.cache_path,
            'checksum': self.checksum,
            'invalidated': self.invalidated,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

