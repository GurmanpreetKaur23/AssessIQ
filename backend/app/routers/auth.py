from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import LoginIn, RegisterIn
from app.security import create_access_token, hash_password, verify_password
from app.services.email_service import send_registration_email
from app.services.user_store import export_users_to_json

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register(payload: RegisterIn, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
  existing = db.query(User).filter(User.email == payload.email).first()
  if existing:
    raise HTTPException(status_code=409, detail="Email already registered")
  user = User(
    name=payload.name,
    email=payload.email,
    password_hash=hash_password(payload.password),
    role=payload.role
  )
  db.add(user)
  db.commit()
  db.refresh(user)
  export_users_to_json(db)
  background_tasks.add_task(send_registration_email, user.email, user.name)
  return {"message": "registered", "email_sent": True, "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}


@router.post("/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
  user = db.query(User).filter(User.email == payload.email).first()
  if not user or not verify_password(payload.password, user.password_hash):
    raise HTTPException(status_code=401, detail="Invalid credentials")
  token = create_access_token({"sub": str(user.id), "role": user.role})
  return {
    "access_token": token,
    "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
  }
