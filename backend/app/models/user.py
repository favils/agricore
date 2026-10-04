from .base import Base

from sqlalchemy.orm import Mapped, mapped_column
from .enums import UserRole
from sqlalchemy import Enum, ForeignKey

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(unique=True)
    hashed_pass: Mapped[str] = mapped_column(nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(
            UserRole,
            values_callable = lambda enum_cls: [x.value for x in enum_cls]
        )
    )