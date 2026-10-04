from fastapi import APIRouter, Depends, HTTPException, Query, status

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role
from app.schemas.field_job import (
    CompletionRead,
    DiscrepencyRead,
    FieldJobCreate,
    FieldJobRead,
    FieldJobStatusUpdate,
    SupervisorActiveFieldHandsRead,
)
from app.models import FieldJob, FieldStatus, User, UserRole, Equipment, FieldHand, Farm

ACTIVE_FIELD_STATUSES = (FieldStatus.PENDING, FieldStatus.IN_PROGRESS)

router = APIRouter(prefix="/fieldjobs", tags=["field jobs"])

@router.get("", response_model=list[FieldJobRead])
async def list_field_jobs(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    statement = select(FieldJob).order_by(FieldJob.id)
    result = await db.execute(statement)

    return list(result.scalars().all())

@router.get("/discrepencies", response_model=list[DiscrepencyRead])
async def get_discrepencies(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    statement = (
        select(
            FieldJob.id.label("field_job_id"),
            FieldJob.title,
            FieldJob.equipment_id,
            FieldJob.field_hand_id,
            Equipment.farm_id.label("equipment_farm_id"),
            FieldHand.farm_id.label("field_hand_farm_id"),
        )
        .join(Equipment, FieldJob.equipment_id == Equipment.id)
        .join(FieldHand, FieldJob.field_hand_id == FieldHand.id)
        .where(Equipment.farm_id != FieldHand.farm_id)
        .order_by(FieldJob.id)
    )

    result = await db.execute(statement)
    return list(result.mappings().all())

@router.get("/completion", response_model=list[CompletionRead])
async def get_completion(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    statement = (
        select(
            Equipment.model,
            func.count(case((FieldJob.status == FieldStatus.COMPLETED, 1))).label("completed"),
            func.count(case((FieldJob.status == FieldStatus.FAILED, 1))).label("failed"),
        )
        .join(Equipment, FieldJob.equipment_id == Equipment.id)
        .group_by(Equipment.model)
        .order_by(Equipment.model)
    )

    result = await db.execute(statement)
    return list(result.mappings().all())

@router.get("/supervisor-active-field-hands", response_model=SupervisorActiveFieldHandsRead)
async def get_supervisor_active_field_hands(
    supervisor_id: int = Query(description="Regional Agronomy Supervisor id"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    statement = (
        select(func.count(func.distinct(FieldHand.id)))
        .join(Farm, FieldHand.farm_id == Farm.id)
        .join(FieldJob, FieldJob.field_hand_id == FieldHand.id)
        .where(Farm.supervisor_id == supervisor_id)
        .where(FieldJob.status.in_(ACTIVE_FIELD_STATUSES))
    )

    result = await db.execute(statement)

    return {"supervisor_id": supervisor_id, "active_field_hand_count": result.scalar_one()}

@router.get("/{field_job_id}", response_model=FieldJobRead)
async def get_field_job(
    field_job_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    field_job = await db.get(FieldJob, field_job_id)
    if field_job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No field job with id {field_job_id}")
    return field_job

@router.post("", response_model=FieldJobRead, status_code=status.HTTP_201_CREATED)
async def create_field_job(
    payload: FieldJobCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.FARM_OP_ADMIN))
):
    field_job = FieldJob(**payload.model_dump())
    db.add(field_job)
    await db.commit()
    await db.refresh(field_job)
    return field_job

@router.put("/{field_job_id}", response_model=FieldJobRead)
async def update_field_job(
    field_job_id: int,
    payload: FieldJobCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.FARM_OP_ADMIN))
):
    field_job = await db.get(FieldJob, field_job_id)
    if field_job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No field job with id {field_job_id}")
    for field, value in payload.model_dump().items():
        setattr(field_job, field, value)
    await db.commit()
    await db.refresh(field_job)
    return field_job

@router.patch("/{field_job_id}/status", response_model=FieldJobRead)
async def update_field_job_status(
    field_job_id: int,
    payload: FieldJobStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.FARM_OP_ADMIN, UserRole.FIELD_HAND))
):
    field_job = await db.get(FieldJob, field_job_id)
    if field_job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No field job with id {field_job_id}")
    field_job.status = payload.status
    await db.commit()
    await db.refresh(field_job)
    return field_job

@router.delete("/{field_job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_field_job(
    field_job_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.FARM_OP_ADMIN))
):
    field_job = await db.get(FieldJob, field_job_id)
    if field_job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No field job with id {field_job_id}")
    await db.delete(field_job)
    await db.commit()
