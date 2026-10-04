from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role
from app.schemas.service_report import ServiceReportRead
from app.models import FieldJob, ServiceReport, User, UserRole
from app.storage import delete_service_report_file, resolve_service_report_file, save_service_report_file

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
    path = resolve_service_report_file(report.file_url)
    if path is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment file is missing")
    return FileResponse(path, filename=path.name.split("-", 5)[-1])

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

    file_url = save_service_report_file(file)

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
    delete_service_report_file(report.file_url)
