from fastapi import APIRouter,Depends,HTTPException,UploadFile,File,Form
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models,schemas
from typing import List,Optional
import pandas as pd
from joblib import dump,load
import boto3
import os
from io import BytesIO
router=APIRouter()
def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()
@router.get("/fake-dashboard")
def fake_dashboard():
    import random
    students=50
    data=[]
    for i in range(students):
        data.append({"student_id":i+1,"predicted_score":random.uniform(40,95),"actual_score":random.uniform(30,100),"accuracy":random.uniform(0.3,0.98)})
    return {"students":data}
@router.post("/train")
def train_model(files:Optional[List[UploadFile]]=None,s3_paths:Optional[List[str]]=None):
    frames=[]
    if files:
        for f in files:
            content=f.file.read()
            try:
                df=pd.read_csv(BytesIO(content))
            except Exception:
                continue
            frames.append(df)
    if s3_paths:
        s3=boto3.client("s3")
        for p in s3_paths:
            if p.startswith("s3://"):
                parts=p[5:].split("/",1)
                bucket=parts[0]
                key=parts[1]
                obj=s3.get_object(Bucket=bucket,Key=key)
                df=pd.read_csv(BytesIO(obj["Body"].read()))
                frames.append(df)
    if not frames:
        return {"ok":False,"reason":"no data"}
    df=pd.concat(frames,ignore_index=True)
    if "score" not in df.columns:
        return {"ok":False,"reason":"no score column"}
    features=[c for c in ["past_score","time_taken","accuracy"] if c in df.columns]
    X=df[features]
    y=df["score"]
    from sklearn.ensemble import RandomForestRegressor
    model=RandomForestRegressor(n_estimators=50,random_state=42)
    model.fit(X,y)
    os.makedirs("backend/models",exist_ok=True)
    dump(model,"backend/models/score_model.joblib")
    return {"ok":True}
@router.post("/predict")
def predict(payload:dict):
    model_path="backend/models/score_model.joblib"
    if not os.path.exists(model_path):
        return {"ok":False,"reason":"no model"}
    model=load(model_path)
    features=[payload.get("past_score"),payload.get("time_taken"),payload.get("accuracy")]
    arr=[f if f is not None else 0 for f in features]
    import numpy as np
    pred=float(model.predict([arr])[0])
    return {"predicted_score":pred}
