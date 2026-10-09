import os
import uuid
from pathlib import Path

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
from fastapi import HTTPException, UploadFile, status

load_dotenv()

BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "")
SERVICE_REPORTS_PREFIX = "service-reports/"

ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "text/plain", "application/pdf"}

s3_client = boto3.client("s3")

def extract_s3_key(file_url: str) -> str:
    without_scheme = file_url.removeprefix("s3://")
    _, _, key = without_scheme.partition("/")
    return key

def original_file_name(file_url: str) -> str:
    return extract_s3_key(file_url).removeprefix(SERVICE_REPORTS_PREFIX).split("-", 5)[-1]

def save_service_report_file(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}"
        )

    key = f"{SERVICE_REPORTS_PREFIX}{uuid.uuid4()}-{Path(file.filename or 'report').name}"
    s3_client.upload_fileobj(file.file, BUCKET_NAME, key, ExtraArgs={"ContentType": file.content_type})

    return f"s3://{BUCKET_NAME}/{key}"

def get_service_report_file(file_url: str) -> dict | None:
    try:
        return s3_client.get_object(Bucket=BUCKET_NAME, Key=extract_s3_key(file_url))
    except ClientError as error:
        if error.response["Error"]["Code"] in ("NoSuchKey", "404"):
            return None
        raise

def delete_service_report_file(file_url: str) -> None:
    s3_client.delete_object(Bucket=BUCKET_NAME, Key=extract_s3_key(file_url))
