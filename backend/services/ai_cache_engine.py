import json
from datetime import datetime

from utils.log_utils import log_calls
from utils.dataset_storage import ai_cache_path, ensure_dataset_layout, resolve_dataset_name

# =========================================================
# CACHE FILE PATH
# =========================================================

def get_cache_path(dataset_name: str):
    resolved_dataset_name = resolve_dataset_name(dataset_name)
    ensure_dataset_layout(resolved_dataset_name)
    return ai_cache_path(resolved_dataset_name)

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

        "dataset_summary": {},

        "profiles": {}
    }

# =========================================================
# CREATE CACHE
# =========================================================

@log_calls
def create_ai_cache(dataset_name: str):

    cache_path = get_cache_path(dataset_name)

    cache_data = default_cache_structure()

    with open(cache_path, "w", encoding="utf-8") as f:

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

        with open(cache_path, "r", encoding="utf-8") as f:

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

    with open(cache_path, "w", encoding="utf-8") as f:

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


@log_calls
def get_ai_cache_section(
    dataset_name: str,
    section: str,
    default=None
):

    cache = load_ai_cache(dataset_name)
    return cache.get(section, default)


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
            ),

            "profiles": len(
                cache.get("profiles", {})
            )
        }
    }

    return summary
