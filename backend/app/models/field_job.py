"""
field_job

id
title
priority
status
equipment_id
field_hand_id
"""

from .base import Base

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Enum, ForeignKey

from .enums import FieldPriority, FieldStatus

class FieldJob(Base):
    __tablename__ = "field_jobs"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    priority: Mapped[FieldPriority] = mapped_column(
        Enum(
            FieldPriority,
            name = "field_priority",
            values_callable = lambda enum_cls: [x.value for x in enum_cls]
        )
    )
    status: Mapped[FieldStatus] = mapped_column(
        Enum(
            FieldStatus,
            name = "field_status",
            values_callable = lambda enum_cls: [x.value for x in enum_cls]
        )
    )
    equipment_id: Mapped[int] = mapped_column(ForeignKey("equipment.id"))
    field_hand_id: Mapped[int] = mapped_column(ForeignKey("field_hands.id"))

