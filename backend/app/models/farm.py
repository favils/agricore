"""
farm
id
name
location_region
supervisor_id 
"""

from .base import Base

from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy import ForeignKey

class Farm(Base):
    __tablename__ = "farms"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    location_region: Mapped[str] = mapped_column(nullable=False)
    capacity: Mapped[int]
    supervisor_id: Mapped[int]