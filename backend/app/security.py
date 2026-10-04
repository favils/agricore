import bcrypt
import jwt
import os

from dotenv import load_dotenv
from datetime import timedelta, datetime, timezone

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRES_MINUTES = 30

def hash_password(plain_pw:str)-> str:
    hashed = bcrypt.hashpw(plain_pw.encode("UTF-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")

def verify_password(plain_pw: str, hash_pw: str) -> bool:
    return bcrypt.checkpw(plain_pw.encode("utf-8"), hash_pw.encode("utf-8"))

def create_access_token(data:dict, expires_delta:timedelta | None = None):
    to_encode = data.copy()
    expires = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRES_MINUTES)
    )
    to_encode["exp"] = expires
    return jwt.encode(to_encode, SECRET_KEY, algorithm= ALGORITHM)

def decode_access_token(token:str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
