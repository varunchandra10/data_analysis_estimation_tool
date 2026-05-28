from __future__ import annotations

from math import ceil
from typing import Any


def paginate_list(data: list[Any], page: int = 1, page_size: int = 20) -> dict[str, Any]:
    normalized_page = max(int(page), 1)
    normalized_page_size = max(int(page_size), 1)

    total_items = len(data)
    total_pages = max(ceil(total_items / normalized_page_size), 1)

    start = (normalized_page - 1) * normalized_page_size
    end = start + normalized_page_size

    items = data[start:end] if start < total_items else []

    return {
        'items': items,
        'meta': {
            'page': normalized_page,
            'page_size': normalized_page_size,
            'total_items': total_items,
            'total_pages': total_pages,
        },
    }
