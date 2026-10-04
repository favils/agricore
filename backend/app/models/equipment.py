from .base import Base

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Enum, ForeignKey

from .enums import EquipmentStatus

"""
equipment table:
    id
    serial_number
    model
    status
    fuel_level
    facility_id
"""

class Equipment(Base):
    __tablename__ = "equipment"

    id: Mapped[int] = mapped_column(primary_key=True)
    serial_number: Mapped[str] = mapped_column(nullable=False)
    model: Mapped[str] = mapped_column(nullable=False)
    status: Mapped[EquipmentStatus] = mapped_column(
        Enum(
            EquipmentStatus,
            name = "equipment_status",
            values_callable = lambda enum_cls: [ x.value for x in enum_cls],
            nullable=False
        )
    )
    fuel_level: Mapped[int] = mapped_column(nullable=False)
    farm_id: Mapped[int] = mapped_column(ForeignKey("farms.id"),nullable=False)
