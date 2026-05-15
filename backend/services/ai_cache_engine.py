import json
from pathlib import Path
from datetime import datetime

from utils.log_utils import log_calls

# =========================================================
# AI CACHE DIRECTORY
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

AI_CACHE_DIR = BASE_DIR / "ai_cache"

AI_CACHE_DIR.mkdir(
    parents=True,
    exist_ok=True
)

# =========================================================
# CACHE FILE PATH
# =========================================================

def get_cache_path(dataset_name: str):

    dataset_stem = Path(dataset_name).stem

    return AI_CACHE_DIR / f"{dataset_stem}_ai_cache.json"

# =========================================================
# DEFAULT CACHE STRUCTURE
# =========================================================

@log_calls
def default_cache_structure():

    return {

        "generated_at": datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        ),

        "missing_values": {},

        "outliers": {},

        "validation": {},

        "weighting": {},

        "dataset_summary": {}
    }

# =========================================================
# CREATE CACHE
# =========================================================

@log_calls
def create_ai_cache(dataset_name: str):

    cache_path = get_cache_path(dataset_name)

    cache_data = default_cache_structure()

    with open(cache_path, "w") as f:

        json.dump(
            cache_data,
            f,
            indent=4
        )

    return cache_data


@log_calls

# =========================================================
# LOAD CACHE
# =========================================================

@log_calls
def load_ai_cache(dataset_name: str):

    cache_path = get_cache_path(dataset_name)

    # CREATE EMPTY CACHE IF NOT EXISTS
    if not cache_path.exists():

        return create_ai_cache(dataset_name)

    try:

        with open(cache_path, "r") as f:

            cache_data = json.load(f)

        return cache_data

    except Exception:

        # CORRUPTED CACHE RECOVERY
        return create_ai_cache(dataset_name)

# =========================================================
# SAVE CACHE
# =========================================================

@log_calls
def save_ai_cache(
    dataset_name: str,
    cache_data: dict
):

    cache_path = get_cache_path(dataset_name)

    cache_data["generated_at"] = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    with open(cache_path, "w") as f:

        json.dump(
            cache_data,
            f,
            indent=4
        )

# =========================================================
# UPDATE CACHE SECTION
# =========================================================

@log_calls
def update_ai_cache_section(
    dataset_name: str,
    section: str,
    section_data: dict
):

    cache = load_ai_cache(dataset_name)

    # ENSURE SECTION EXISTS
    if section not in cache:

        cache[section] = {}

    cache[section] = section_data

    save_ai_cache(
        dataset_name,
        cache
    )

    return cache


# =========================================================
# APPEND SINGLE ENTRY
# =========================================================


@log_calls
def append_ai_cache_entry(
    dataset_name: str,
    section: str,
    key: str,
    value: dict
):

    cache = load_ai_cache(dataset_name)

    if section not in cache:

        cache[section] = {}

    cache[section][key] = value

    save_ai_cache(
        dataset_name,
        cache
    )

    return cache


@log_calls
def ai_cache_exists(dataset_name: str):

    cache_path = get_cache_path(dataset_name)

    return cache_path.exists()


# =========================================================
# INVALIDATE CACHE
# =========================================================

@log_calls
def invalidate_ai_cache(dataset_name: str):

    cache_path = get_cache_path(dataset_name)

    if cache_path.exists():

        cache_path.unlink()

    # RECREATE CLEAN CACHE
    return create_ai_cache(dataset_name)


@log_calls
def delete_ai_cache(dataset_name: str):

    cache_path = get_cache_path(dataset_name)

    if cache_path.exists():

        cache_path.unlink()

        return True

    return False


@log_calls
def get_ai_cache_summary(dataset_name: str):

    cache = load_ai_cache(dataset_name)

    summary = {

        "generated_at": cache.get(
            "generated_at"
        ),

        "sections": {

            "missing_values": len(
                cache.get("missing_values", {})
            ),

            "outliers": len(
                cache.get("outliers", {})
            ),

            "validation": len(
                cache.get("validation", {})
            ),

            "weighting": len(
                cache.get("weighting", {})
            ),

            "dataset_summary": len(
                cache.get("dataset_summary", {})
            )
        }
    }

    return summary