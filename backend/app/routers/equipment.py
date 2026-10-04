from fastapi import APIRouter, Depends, HTTPException, Query, status

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.equipment import EquipmentRead, EquipmentCreate
from app.dependencies import get_db, get_current_user, require_role
from app.models import Equipment, EquipmentStatus, User, UserRole

router = APIRouter(prefix="/equipment", tags=["equipment"])

@router.get("", response_model=list[EquipmentRead])
async def list_equipment(
    max_fuel: int | None = Query(
        default=None,
        ge=0,
        le=100,
        description="Only returns active (non-retired) equipment strictly below this fuel level."
    ),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    statement = select(Equipment)
    if max_fuel is not None:
        statement = statement.where(
            Equipment.fuel_level < max_fuel,
            Equipment.status != EquipmentStatus.RETIRED
        )
    statement = statement.order_by(Equipment.id)

    result = await db.execute(statement)

    return list(result.scalars().all())

@router.get("/{equipment_id}", response_model=EquipmentRead)
async def get_equipment(
    equipment_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    equipment = await db.get(Equipment, equipment_id)
    if equipment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No equipment with id {equipment_id}")
    return equipment

@router.post("", response_model=EquipmentRead, status_code=status.HTTP_201_CREATED)
async def create_equipment(
    payload: EquipmentCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.FARM_OP_ADMIN))
):
    equipment = Equipment(**payload.model_dump())
    db.add(equipment)
    await db.commit()
    await db.refresh(equipment)
    return equipment

@router.put("/{equipment_id}", response_model=EquipmentRead)
async def update_equipment(
    equipment_id: int,
    payload: EquipmentCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.FARM_OP_ADMIN))
):
    equipment = await db.get(Equipment, equipment_id)
    if equipment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No equipment with id {equipment_id}")
    for field, value in payload.model_dump().items():
        setattr(equipment, field, value)
    await db.commit()
    await db.refresh(equipment)
    return equipment

@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment(
    equipment_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.FARM_OP_ADMIN))
):
    equipment = await db.get(Equipment, equipment_id)
    if equipment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No equipment with id {equipment_id}")
    await db.delete(equipment)
    await db.commit()
