import json

from pathlib import Path
from datetime import datetime
import logging
import functools
import time

# ==========================================
# DIRECTORIES
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent

LOGS_DIR = BASE_DIR / "logs"

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

    @functools.wraps(fn)
    def wrapper(*args, **kwargs):

        name = f"{fn.__module__}.{fn.__name__}"

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

    log_file = (
        LOGS_DIR
        / f"{Path(dataset_name).stem}_logs.json"
    )

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

            with open(log_file, "r") as f:

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

    with open(log_file, "w") as f:

        json.dump(
            logs,
            f,
            indent=4
        )