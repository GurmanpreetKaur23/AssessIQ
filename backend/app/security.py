from datetime import datetime, timedelta, timezone
import hashlib
from jose import jwt
from passlib.context import CryptContext
from passlib.exc import UnknownHashError

SECRET_KEY = "assessiq-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def _normalize_password(password: str) -> str:
  return hashlib.sha256(password.encode("utf-8")).hexdigest()


def hash_password(password: str) -> str:
  return pwd_context.hash(_normalize_password(password))


def verify_password(password: str, password_hash: str) -> bool:
  try:
    return pwd_context.verify(_normalize_password(password), password_hash)
  except UnknownHashError:
    return False


def create_access_token(data: dict) -> str:
  to_encode = data.copy()
  expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
  to_encode.update({"exp": expire})
  return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
