from core.database import Base

# Import models to ensure metadata is registered
from models.user_model import User  # noqa: F401
from models.project_model import Project  # noqa: F401
from models.dataset_model import Dataset  # noqa: F401
from models.version_model import Version  # noqa: F401
from models.report_model import Report  # noqa: F401
from models.audit_log_model import AuditLog  # noqa: F401
from models.ai_cache_model import AICacheRef  # noqa: F401
