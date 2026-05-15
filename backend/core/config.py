from pathlib import Path

# Project root (two levels above this file: backend/core -> backend -> project root)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Ensure commonly-used folders point to the workspace root
DATASETS_DIR = BASE_DIR / "datasets"
LOGS_DIR = BASE_DIR / "logs"
AI_CACHE_DIR = BASE_DIR / "ai_cache"

# Create directories if they don't exist to avoid FileNotFoundErrors
for _dir in (DATASETS_DIR, LOGS_DIR, AI_CACHE_DIR):
	try:
		_dir.mkdir(parents=True, exist_ok=True)
	except Exception:
		pass

MAX_ROWS = 500000
MAX_VIOLATIONS_RETURNED = 100

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "phi3"