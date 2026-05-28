from __future__ import annotations

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from core.database import Base


class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey('datasets.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    version_id = Column(Integer, ForeignKey('versions.id'), nullable=True)
    action = Column(String(256), nullable=False)  # keep for compat
    operation = Column(String(256), nullable=False)
    actor = Column(String(256), nullable=True)
    status = Column(String(64), nullable=True)
    details = Column(Text, nullable=True)  # keep for compat
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'dataset_id': self.dataset_id,
            'user_id': self.user_id,
            'version_id': self.version_id,
            'action': self.action,
            'operation': self.operation,
            'actor': self.actor,
            'status': self.status,
            'details': self.details,
            'details_json': self.details_json,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

