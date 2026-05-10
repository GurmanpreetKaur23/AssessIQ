from fastapi import APIRouter
from app.database import SessionLocal
from app import models
from sklearn.linear_model import LinearRegression
import pandas as pd
import numpy as np
from joblib import dump
router=APIRouter()
@router.get("/fake-dashboard")
def fake_dashboard():
    import random
    students=50
    data=[]
    for i in range(students):
        data.append({"student_id":i+1,"predicted_score":random.uniform(40,95),"actual_score":random.uniform(30,100),"accuracy":random.uniform(0.3,0.98)})
    return {"students":data}
@router.post("/train")
def train_model():
    df=pd.DataFrame({"past_score":[60,70,80,90,50,40],"time_taken":[30,25,40,20,50,60],"accuracy":[0.6,0.7,0.8,0.9,0.5,0.4],"score":[65,72,85,92,48,45]})
    X=df[["past_score","time_taken","accuracy"]]
    y=df["score"]
    model=LinearRegression()
    model.fit(X,y)
    dump(model,"backend/models/score_model.joblib")
    return {"ok":True}
