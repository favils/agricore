from .base import Base

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey

class FieldHand(Base):
    __tablename__ = "field_hands"

    id: Mapped[int] = mapped_column(primary_key = True)
    name: Mapped[str]
    farm_id: Mapped[int] = mapped_column(ForeignKey("farms.id"))
