from pathlib import Path

from services.signed_download_service import generate_signed_token, validate_signed_token
from utils.dataset_storage import ensure_dataset_layout, processed_dir


def test_signed_download_token_round_trip():
    dataset_name = "signed_download_test"
    ensure_dataset_layout(dataset_name)
    source_path = processed_dir(dataset_name) / "raw_signed_download_test.csv"
    source_path.write_text("a,b\n1,2\n", encoding="utf-8")

    token = generate_signed_token(str(source_path), expires_seconds=60)
    payload = validate_signed_token(token)

    assert payload["file_path"] == str(source_path.resolve())
