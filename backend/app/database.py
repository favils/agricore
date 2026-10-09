from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

import os

from dotenv import load_dotenv

load_dotenv()

engine = create_async_engine(os.getenv("DATABASE_URL"), echo = True, poolclass = NullPool)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit = False)
