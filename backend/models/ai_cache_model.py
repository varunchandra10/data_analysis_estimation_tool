from __future__ import annotations

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from core.database import Base


class AICacheRef(Base):
    __tablename__ = 'ai_cache_refs'

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey('datasets.id'), nullable=False)
    cache_type = Column(String(128), nullable=False)
    cache_path = Column(String(1024), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {'id': self.id, 'dataset_id': self.dataset_id, 'cache_type': self.cache_type, 'cache_path': self.cache_path}
