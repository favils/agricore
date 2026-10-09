from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import StreamingResponse

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role
from app.schemas.service_report import ServiceReportRead
from app.models import FieldJob, ServiceReport, User, UserRole
from app.storage import delete_service_report_file, get_service_report_file, original_file_name, save_service_report_file

router = APIRouter(prefix="/service-reports", tags=["service reports"])

@router.get("", response_model=list[ServiceReportRead])
async def list_service_reports(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    result = await db.execute(select(ServiceReport).order_by(ServiceReport.id))
    return list(result.scalars().all())

@router.get("/{report_id}/file")
async def download_service_report_file(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    report = await db.get(ServiceReport, report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No service report with id {report_id}")
    s3_object = await run_in_threadpool(get_service_report_file, report.file_url)
    if s3_object is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment file is missing")
    return StreamingResponse(
        s3_object["Body"].iter_chunks(),
        media_type=s3_object.get("ContentType", "application/octet-stream"),
        headers={"Content-Disposition": f'attachment; filename="{original_file_name(report.file_url)}"'}
    )

@router.post("", response_model=ServiceReportRead, status_code=status.HTTP_201_CREATED)
async def create_service_report(
    field_job_id: int = Form(...),
    notes: str = Form(""),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.FARM_OP_ADMIN, UserRole.FIELD_HAND))
):
    if await db.get(FieldJob, field_job_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No field job with id {field_job_id}")

    file_url = await run_in_threadpool(save_service_report_file, file)

    report = ServiceReport(field_job_id=field_job_id, file_url=file_url, notes=notes)
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.FARM_OP_ADMIN))
):
    report = await db.get(ServiceReport, report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No service report with id {report_id}")
    await db.delete(report)
    await db.commit()
    await run_in_threadpool(delete_service_report_file, report.file_url)
