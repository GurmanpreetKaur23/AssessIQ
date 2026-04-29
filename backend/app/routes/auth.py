from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..deps import get_current_user
from ..database import get_db
from ..models import User
from ..schemas import ForgotPasswordIn, LoginIn, RegisterIn, Token
from ..security import create_access_token
from ..services.user_store import authenticate, create_user, find_user, list_public_users, public_user, reset_password

router = APIRouter(prefix="/auth", tags=["auth"])


def db_payload(user: User):
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role}


def mirror_user(db: Session, user_data: dict):
    user = db.query(User).filter(User.email == user_data["email"]).first()
    if not user:
        user = User(name=user_data["name"], email=user_data["email"], password_hash=user_data["password_hash"], role=user_data["role"])
        db.add(user)
    else:
        user.name = user_data["name"]
        user.password_hash = user_data["password_hash"]
        user.role = user_data["role"]
    db.commit()
    db.refresh(user)
    return user


@router.post("/register", response_model=Token)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    user_data = create_user(data.name, data.email, data.password, data.role)
    if not user_data:
        raise HTTPException(status_code=409, detail="Email already registered")
    mirror_user(db, user_data)
    return {"access_token": create_access_token(user_data["email"], user_data["role"]), "user": public_user(user_data)}


@router.post("/login", response_model=Token)
def login(data: LoginIn, db: Session = Depends(get_db)):
    user_data = authenticate(data.email, data.password)
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    mirror_user(db, user_data)
    return {"access_token": create_access_token(user_data["email"], user_data["role"]), "user": public_user(user_data)}


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordIn, db: Session = Depends(get_db)):
    user_data = reset_password(data.email, data.new_password)
    if not user_data:
        raise HTTPException(status_code=404, detail="No account found for this email")
    mirror_user(db, user_data)
    return {"message": "Password updated. You can login with the new password."}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    stored = find_user(user.email)
    return public_user(stored) if stored else db_payload(user)


@router.get("/users")
def users(user: User = Depends(get_current_user)):
    return list_public_users()
