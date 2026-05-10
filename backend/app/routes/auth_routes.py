from fastapi import APIRouter,Depends,HTTPException,status,Request
from sqlalchemy.orm import Session
from app import models,schemas
from app.database import SessionLocal
from app.auth import get_password_hash,verify_password,create_access_token,send_sns_email
from datetime import timedelta
import os
import requests
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
        payload=jwt.decode(token_str,os.getenv("SECRET_KEY","supersecret"),algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=400,detail="invalid token")
    email=payload.get("sub")
    user=db.query(models.User).filter(models.User.email==email).first()
    if not user:
        raise HTTPException(status_code=404,detail="no user")
    user.is_verified=True
    db.commit()
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
@router.get("/google/login")
def google_login():
    client_id=os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri=os.getenv("GOOGLE_REDIRECT_URI")
    scope="openid email profile"
    state="state"
    url=f"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}&scope={scope}&state={state}&access_type=offline&prompt=consent"
    return {"url":url}
@router.get("/google/callback")
def google_callback(request:Request,db:Session=Depends(get_db)):
    code=request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400,detail="code required")
    token_endpoint="https://oauth2.googleapis.com/token"
    client_id=os.getenv("GOOGLE_CLIENT_ID")
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET")
    redirect_uri=os.getenv("GOOGLE_REDIRECT_URI")
    data={"code":code,"client_id":client_id,"client_secret":client_secret,"redirect_uri":redirect_uri,"grant_type":"authorization_code"}
    r=requests.post(token_endpoint,data=data)
    if r.status_code!=200:
        raise HTTPException(status_code=400,detail="token exchange failed")
    token_data=r.json()
    access_token=token_data.get("access_token")
    userinfo_r=requests.get("https://openidconnect.googleapis.com/v1/userinfo",headers={"Authorization":f"Bearer {access_token}"})
    if userinfo_r.status_code!=200:
        raise HTTPException(status_code=400,detail="userinfo failed")
    info=userinfo_r.json()
    email=info.get("email")
    full_name=info.get("name")
    user=db.query(models.User).filter(models.User.email==email).first()
    if not user:
        user=models.User(email=email,full_name=full_name,is_verified=True)
        db.add(user)
        db.commit()
        db.refresh(user)
    token=create_access_token({"sub":user.email})
    return {"access_token":token,"token_type":"bearer"}
