import json

from pathlib import Path
from datetime import datetime
import inspect
import logging
import functools
import time

from utils.dataset_storage import SERVER_LOGS_ROOT, audit_log_path, ensure_dataset_layout, resolve_dataset_name

# ==========================================
# DIRECTORIES
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent

LOGS_DIR = SERVER_LOGS_ROOT

LOGS_DIR.mkdir(
    parents=True,
    exist_ok=True
)

# -------------------------
# Console + File logger
# -------------------------
logger = logging.getLogger("backend_logger")
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    )
    ch.setFormatter(formatter)
    logger.addHandler(ch)


def log_to_file(message: str):
    """Append a timestamped message to a general backend log file."""

    try:
        log_file = LOGS_DIR / "backend_console.log"

        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - {message}\n")
    except Exception:
        pass


def log_calls(fn):
    """Decorator to log function entry, exit, duration and exceptions."""

    name = f"{fn.__module__}.{fn.__name__}"

    if inspect.iscoroutinefunction(fn):

        @functools.wraps(fn)
        async def async_wrapper(*args, **kwargs):

            try:
                logger.info(f"ENTER {name} args={args if len(args)<=5 else '(... )'} kwargs={list(kwargs.keys())}")
                log_to_file(f"ENTER {name}")
                start = time.time()

                result = await fn(*args, **kwargs)

                duration = (time.time() - start) * 1000
                logger.info(f"EXIT {name} duration={duration:.2f}ms")
                log_to_file(f"EXIT {name} duration={duration:.2f}ms")

                return result

            except Exception as e:
                logger.exception(f"EXCEPTION in {name}: {e}")
                log_to_file(f"EXCEPTION in {name}: {e}")
                raise

        return async_wrapper

    @functools.wraps(fn)
    def wrapper(*args, **kwargs):

        try:
            logger.info(f"ENTER {name} args={args if len(args)<=5 else '(... )'} kwargs={list(kwargs.keys())}")
            log_to_file(f"ENTER {name}")
            start = time.time()

            result = fn(*args, **kwargs)

            duration = (time.time() - start) * 1000
            logger.info(f"EXIT {name} duration={duration:.2f}ms")
            log_to_file(f"EXIT {name} duration={duration:.2f}ms")

            return result

        except Exception as e:
            logger.exception(f"EXCEPTION in {name}: {e}")
            log_to_file(f"EXCEPTION in {name}: {e}")
            raise

    return wrapper


def save_cleaning_log(
    dataset_name,
    operation,
    rows_affected,
    details=None
):

    resolved_dataset_name = resolve_dataset_name(dataset_name)
    ensure_dataset_layout(resolved_dataset_name)
    log_file = audit_log_path(resolved_dataset_name)

    log_entry = {

        "operation": operation,

        "rows_affected": int(
            rows_affected
        ),

        "timestamp": datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),

        "details": details or {}

    }

    logs = []

    # ==========================================
    # LOAD EXISTING LOGS
    # ==========================================

    if log_file.exists():

        try:

            with open(log_file, "r", encoding="utf-8") as f:

                logs = json.load(f)

        except:

            logs = []

    # ==========================================
    # APPEND NEW LOG
    # ==========================================

    logs.append(log_entry)

    # ==========================================
    # SAVE
    # ==========================================

    with open(log_file, "w", encoding="utf-8") as f:

        json.dump(
            logs,
            f,
            indent=4
        )
    # attempt to persist audit log to DB
    try:
        from services.audit_log_service import record_audit_log
        record_audit_log(dataset_name=dataset_name, action=operation, details={'rows_affected': rows_affected, **(details or {})})
    except Exception:
        pass
