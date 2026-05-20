from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


def _load_dotenv(env_path: Path) -> None:
	if not env_path.exists():
		return

	for raw_line in env_path.read_text(encoding='utf-8').splitlines():
		line = raw_line.strip()
		if not line or line.startswith('#') or '=' not in line:
			continue

		key, value = line.split('=', 1)
		key = key.strip()
		value = value.strip().strip('"').strip("'")
		os.environ.setdefault(key, value)


BASE_DIR = Path(__file__).resolve().parent.parent.parent
_load_dotenv(BASE_DIR / '.env')


class AppConfig(BaseModel):
	model_config = ConfigDict(extra='ignore', frozen=True)

	base_dir: Path = Field(default=BASE_DIR)
	dataset_dir: Path = Field(default=BASE_DIR / 'backend' / 'datasets')
	logs_dir: Path = Field(default=BASE_DIR / 'backend' / 'logs')
	ai_cache_dir: Path = Field(default=BASE_DIR / 'backend' / 'datasets')
	reports_dir: Path = Field(default=BASE_DIR / 'backend' / 'reports')
	archive_dir: Path = Field(default=BASE_DIR / 'backend' / 'datasets' / 'archive')
	database_url: str = Field(default_factory=lambda: os.getenv('DATABASE_URL', f"sqlite:///{BASE_DIR / 'backend' / 'daet.sqlite3'}"))
	ollama_url: str = Field(default_factory=lambda: os.getenv('OLLAMA_URL', 'http://localhost:11434/api/generate'))
	ollama_model: str = Field(default_factory=lambda: os.getenv('OLLAMA_MODEL', 'phi3'))
	encryption_key: str | None = Field(default_factory=lambda: os.getenv('ENCRYPTION_KEY'))
	secret_key: str = Field(default_factory=lambda: os.getenv('SECRET_KEY', 'replace-me-with-secure-key'))
	default_project: str = Field(default_factory=lambda: os.getenv('DEFAULT_PROJECT', 'default'))
	max_rows: int = Field(default_factory=lambda: int(os.getenv('MAX_ROWS', '500000')))
	max_violations: int = Field(default_factory=lambda: int(os.getenv('MAX_VIOLATIONS', '100')))
	cors_origins: tuple[str, ...] = Field(default_factory=lambda: tuple(origin.strip() for origin in os.getenv('CORS_ORIGINS', '*').split(',') if origin.strip()))
	allowed_file_types: tuple[str, ...] = Field(default_factory=lambda: tuple(ft.strip() for ft in os.getenv('ALLOWED_FILE_TYPES', '.csv,.xlsx').split(',') if ft.strip()))


settings = AppConfig()

DATASETS_DIR = settings.dataset_dir
LOGS_DIR = settings.logs_dir
AI_CACHE_DIR = settings.ai_cache_dir
REPORTS_DIR = settings.reports_dir
ARCHIVE_DIR = settings.archive_dir
OLLAMA_URL = settings.ollama_url
OLLAMA_MODEL = settings.ollama_model
ENCRYPTION_KEY = settings.encryption_key
DEFAULT_PROJECT = settings.default_project
MAX_ROWS = settings.max_rows
MAX_VIOLATIONS_RETURNED = settings.max_violations
ALLOWED_FILE_TYPES = settings.allowed_file_types
DATABASE_URL = settings.database_url
SECRET_KEY = settings.secret_key
JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_SECONDS = int(os.getenv('ACCESS_TOKEN_EXPIRE_SECONDS', '3600'))
CORS_ORIGINS = settings.cors_origins
