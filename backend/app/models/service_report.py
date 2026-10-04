from .base import Base
"""
service_report

id
file_url
notes
timestamp
"""
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Text, func, DateTime, ForeignKey

from datetime import datetime

class ServiceReport(Base):

    __tablename__ = "service_reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    field_job_id: Mapped[int] = mapped_column(ForeignKey("field_jobs.id"))
    file_url: Mapped[str] = mapped_column(Text)
    notes: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now()
    )