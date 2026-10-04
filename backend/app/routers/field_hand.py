from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role
from app.schemas.field_hand import FieldHandCreate, FieldHandRead
from app.models import FieldHand, User, UserRole

router = APIRouter(prefix="/fieldhands", tags=["field hands"])

@router.get("", response_model=list[FieldHandRead])
async def list_field_hands(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    result = await db.execute(select(FieldHand).order_by(FieldHand.id))
    return list(result.scalars().all())

@router.get("/{field_hand_id}", response_model=FieldHandRead)
async def get_field_hand(
    field_hand_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    field_hand = await db.get(FieldHand, field_hand_id)
    if field_hand is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No field hand with id {field_hand_id}")
    return field_hand

@router.post("", response_model=FieldHandRead, status_code=status.HTTP_201_CREATED)
async def create_field_hand(
    payload: FieldHandCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.FARM_OP_ADMIN))
):
    field_hand = FieldHand(**payload.model_dump())
    db.add(field_hand)
    await db.commit()
    await db.refresh(field_hand)
    return field_hand

@router.put("/{field_hand_id}", response_model=FieldHandRead)
async def update_field_hand(
    field_hand_id: int,
    payload: FieldHandCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.FARM_OP_ADMIN))
):
    field_hand = await db.get(FieldHand, field_hand_id)
    if field_hand is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No field hand with id {field_hand_id}")
    for field, value in payload.model_dump().items():
        setattr(field_hand, field, value)
    await db.commit()
    await db.refresh(field_hand)
    return field_hand

@router.delete("/{field_hand_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_field_hand(
    field_hand_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.FARM_OP_ADMIN))
):
    field_hand = await db.get(FieldHand, field_hand_id)
    if field_hand is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No field hand with id {field_hand_id}")
    await db.delete(field_hand)
    await db.commit()
