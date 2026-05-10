from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models
from pydantic import BaseModel
router=APIRouter()
def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()
class EventPayload(BaseModel):
    user_id:int
    question_id:int
    event_type:str
    time_spent:float
    mouse_data:str=None
    revisit_count:int=0
@router.post("/track")
def track_event(payload:EventPayload,db:Session=Depends(get_db)):
    evt=models.Event(user_id=payload.user_id,question_id=payload.question_id,event_type=payload.event_type,time_spent=payload.time_spent,mouse_data=payload.mouse_data or "",revisit_count=payload.revisit_count)
    db.add(evt)
    db.commit()
    db.refresh(evt)
    return {"id":evt.id}
