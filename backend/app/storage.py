import os
import shutil
import uuid
from pathlib import Path

from dotenv import load_dotenv
from fastapi import HTTPException, UploadFile, status

load_dotenv()

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", Path(__file__).resolve().parent.parent / "uploads"))

ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "text/plain", "application/pdf"}

def save_service_report_file(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}"
        )

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    file_name = f"{uuid.uuid4()}-{Path(file.filename or 'report').name}"

    with open(UPLOAD_DIR / file_name, "wb") as destination:
        shutil.copyfileobj(file.file, destination)

    return file_name

def resolve_service_report_file(file_url: str) -> Path | None:
    path = (UPLOAD_DIR / file_url).resolve()
    if path.parent != UPLOAD_DIR.resolve() or not path.is_file():
        return None
    return path

def delete_service_report_file(file_url: str) -> None:
    path = resolve_service_report_file(file_url)
    if path is not None:
        path.unlink()
