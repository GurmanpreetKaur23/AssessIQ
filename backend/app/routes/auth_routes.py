from fastapi import APIRouter,Depends,HTTPException,status
from sqlalchemy.orm import Session
from app import models,schemas
from app.database import SessionLocal
from app.auth import get_password_hash,verify_password,create_access_token,send_sns_email
from datetime import timedelta
router=APIRouter()
def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()
@router.post("/register",response_model=schemas.UserOut)
def register(user:schemas.UserCreate,db:Session=Depends(get_db)):
    existing=db.query(models.User).filter(models.User.email==user.email).first()
    if existing:
        raise HTTPException(status_code=400,detail="Email already registered")
    hashed=get_password_hash(user.password)
    db_user=models.User(email=user.email,hashed_password=hashed,full_name=user.full_name,role=user.role or "student")
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    token=create_access_token({"sub":db_user.email},expires_delta=timedelta(hours=24))
    send_sns_email("Verify your AssessIQ account",f"Verify token: {token}",db_user.email)
    return db_user
@router.post("/verify")
def verify(token:dict,db:Session=Depends(get_db)):
    token_str=token.get("token")
    if not token_str:
        raise HTTPException(status_code=400,detail="token required")
    from jose import jwt
    try:
        payload=jwt.decode(token_str,create_access_token({}),os.getenv("SECRET_KEY","supersecret"))
    except Exception:
        pass
    return {"ok":True}
@router.post("/login",response_model=schemas.Token)
def login(data:dict,db:Session=Depends(get_db)):
    email=data.get("email")
    password=data.get("password")
    user=db.query(models.User).filter(models.User.email==email).first()
    if not user:
        raise HTTPException(status_code=400,detail="Invalid credentials")
    if not verify_password(password,user.hashed_password):
        raise HTTPException(status_code=400,detail="Invalid credentials")
    token=create_access_token({"sub":user.email})
    return {"access_token":token,"token_type":"bearer"}
@router.post("/forgot-password")
def forgot(data:dict,db:Session=Depends(get_db)):
    email=data.get("email")
    user=db.query(models.User).filter(models.User.email==email).first()
    if not user:
        return {"ok":True}
    token=create_access_token({"sub":user.email},expires_delta=timedelta(hours=1))
    send_sns_email("Password reset","Reset token: "+token,email)
    return {"ok":True}
