import json
import shutil
from datetime import datetime
from pathlib import Path

from core.config import AI_CACHE_DIR
from utils.log_utils import log_calls
from utils.dataset_storage import resolve_dataset_name
from core.database import SessionLocal
from models.ai_cache_model import AICacheRef
from models.dataset_model import Dataset

AI_CACHE_ROOT = AI_CACHE_DIR

def _get_cache_dir(section: str) -> Path:
    d = AI_CACHE_ROOT / section
    d.mkdir(parents=True, exist_ok=True)
    return d

def _get_cache_path(dataset_name: str, section: str) -> Path:
    resolved = resolve_dataset_name(dataset_name)
    return _get_cache_dir(section) / f"{resolved}.json"

def _update_db_ref(dataset_name: str, cache_path: Path):
    try:
        db = SessionLocal()
        ds = db.query(Dataset).filter(Dataset.dataset_name == resolve_dataset_name(dataset_name)).first()
        if ds:
            from utils.hash_utils import generate_sha256
            from models.version_model import Version
            from utils.file_utils import resolve_safe_path
            
            safe_cache_path = resolve_safe_path(cache_path)
            checksum = generate_sha256(safe_cache_path) if safe_cache_path.exists() else None
            
            # Find latest version for this dataset
            latest_version = db.query(Version).filter(Version.dataset_id == ds.id).order_by(Version.created_at.desc()).first()
            version_id = latest_version.id if latest_version else None
            
            # Check if ref exists
            exists = db.query(AICacheRef).filter(AICacheRef.dataset_id == ds.id, AICacheRef.cache_path == str(safe_cache_path)).first()
            if not exists:
                ref = AICacheRef(
                    dataset_id=ds.id,
                    version_id=version_id,
                    cache_type='ai_cache',
                    cache_path=str(safe_cache_path),
                    checksum=checksum,
                    invalidated=False
                )
                db.add(ref)
                db.commit()
            else:
                exists.version_id = version_id
                exists.checksum = checksum
                exists.invalidated = False
                db.commit()
    except Exception as db_err:
        from utils.log_utils import logger
        logger.warning(
            f'_update_db_ref: DB synchronization failed for AI cache at {cache_path}: {db_err}',
            exc_info=True,
        )
    finally:
        try:
            db.close()
        except Exception:
            pass


@log_calls
def create_ai_cache_section(dataset_name: str, section: str, initial_data: dict = None):
    cache_path = _get_cache_path(dataset_name, section)
    data = initial_data or {}
    data["generated_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
    _update_db_ref(dataset_name, cache_path)
    return data

@log_calls
def load_ai_cache_section(dataset_name: str, section: str, default: dict = None):
    cache_path = _get_cache_path(dataset_name, section)
    if not cache_path.exists():
        return default or {}
    try:
        with open(cache_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default or {}

@log_calls
def save_ai_cache_section(dataset_name: str, section: str, cache_data: dict):
    return create_ai_cache_section(dataset_name, section, cache_data)

@log_calls
def ai_cache_exists(dataset_name: str, section: str) -> bool:
    return _get_cache_path(dataset_name, section).exists()

@log_calls
def invalidate_section(dataset_name: str, section: str):
    from utils.file_utils import resolve_safe_path
    cache_path = resolve_safe_path(_get_cache_path(dataset_name, section))
    if cache_path.exists():
        cache_path.unlink()
    try:
        db = SessionLocal()
        ref = db.query(AICacheRef).filter(AICacheRef.cache_path == str(cache_path)).first()
        if ref:
            ref.invalidated = True
            db.commit()
        db.close()
    except Exception:
        pass


@log_calls
def invalidate_ai_cache(dataset_name: str):
    """Invalidates ALL AI cache sections for the dataset."""
    for section in ["recommendations", "explanations", "module_ai", "profiles"]:
        invalidate_section(dataset_name, section)

@log_calls
def get_ai_cache_summary(dataset_name: str):
    summary = {"sections": {}}
    for section in ["recommendations", "explanations", "module_ai", "profiles"]:
        data = load_ai_cache_section(dataset_name, section)
        summary["sections"][section] = len(data) if isinstance(data, (dict, list)) else (1 if data else 0)
    return summary
