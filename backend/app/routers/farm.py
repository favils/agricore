from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role
from app.schemas.farm import FarmCreate, FarmRead, MaintenanceFlagRead
from app.models import Farm, Equipment, EquipmentStatus, User, UserRole

router = APIRouter(prefix="/farms", tags=["farms"])

@router.get("", response_model=list[FarmRead])
async def list_farms(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    result = await db.execute(select(Farm).order_by(Farm.id))
    return list(result.scalars().all())

@router.get("/maintenance-flags", response_model=list[MaintenanceFlagRead])
async def list_maintenance_flags(
    min_percentage: Decimal = Query(
        default=Decimal(30),
        ge=0,
        le=100,
        description="Only returns farms with more than this percentage of equipment flagged for maintenance"
    ),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    total_equipment = func.count(Equipment.id)
    maintenance_equipment = func.count(case((Equipment.status == EquipmentStatus.MAINTENANCE, 1)))

    statement = (
        select(
            Farm.id.label("farm_id"),
            Farm.name,
            total_equipment.label("total_equipment"),
            maintenance_equipment.label("maintenance_equipment"),
        )
        .join(Equipment, Equipment.farm_id == Farm.id)
        .group_by(Farm.id, Farm.name)
        .having(maintenance_equipment * 100 > total_equipment * min_percentage)
        .order_by(Farm.id)
    )

    result = await db.execute(statement)
    return list(result.mappings().all())

@router.get("/{farm_id}", response_model=FarmRead)
async def get_farm(
    farm_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    farm = await db.get(Farm, farm_id)
    if farm is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No farm with id {farm_id}")
    return farm

@router.post("", response_model=FarmRead, status_code=status.HTTP_201_CREATED)
async def create_farm(
    payload: FarmCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.FARM_OP_ADMIN))
):
    farm = Farm(**payload.model_dump())
    db.add(farm)
    await db.commit()
    await db.refresh(farm)
    return farm

@router.put("/{farm_id}", response_model=FarmRead)
async def update_farm(
    farm_id: int,
    payload: FarmCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.FARM_OP_ADMIN))
):
    farm = await db.get(Farm, farm_id)
    if farm is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No farm with id {farm_id}")
    for field, value in payload.model_dump().items():
        setattr(farm, field, value)
    await db.commit()
    await db.refresh(farm)
    return farm

@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_farm(
    farm_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.FARM_OP_ADMIN))
):
    farm = await db.get(Farm, farm_id)
    if farm is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No farm with id {farm_id}")
    await db.delete(farm)
    await db.commit()
