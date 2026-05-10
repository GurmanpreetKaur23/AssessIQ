from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models,schemas
from typing import List
router=APIRouter()
def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()
@router.post("/create")
def create_test(payload:schemas.TestCreate,db:Session=Depends(get_db)):
    test=models.Test(title=payload.title,description=payload.description)
    db.add(test)
    db.commit()
    db.refresh(test)
    return {"id":test.id}
@router.post("/add-question")
def add_question(q:schemas.QuestionCreate,db:Session=Depends(get_db)):
    test=db.query(models.Test).first()
    if not test:
        raise HTTPException(status_code=404,detail="no test")
    question=models.Question(test_id=test.id,prompt=q.prompt,difficulty=q.difficulty or "medium",topic=q.topic,correct_answer=q.correct_answer)
    db.add(question)
    db.commit()
    db.refresh(question)
    return {"id":question.id}
@router.post("/submit")
def submit(payload:schemas.SubmitPayload,db:Session=Depends(get_db)):
    user=db.query(models.User).first()
    if not user:
        raise HTTPException(status_code=404,detail="no user")
    test=db.query(models.Test).filter(models.Test.id==payload.test_id).first()
    if not test:
        raise HTTPException(status_code=404,detail="no test")
    questions=test.questions
    correct=0
    for i,ans in enumerate(payload.answers):
        if i < len(questions) and ans==questions[i].correct_answer:
            correct+=1
    accuracy=correct/len(questions) if questions else 0
    score=accuracy*100
    submission=models.Submission(user_id=user.id,test_id=test.id,answers=str(payload.answers),score=score,accuracy=accuracy,time_taken=payload.time_taken)
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return {"score":score,"accuracy":accuracy}
@router.get("/history")
def history(db:Session=Depends(get_db)):
    user=db.query(models.User).first()
    if not user:
        return []
    subs=db.query(models.Submission).filter(models.Submission.user_id==user.id).all()
    out=[]
    for s in subs:
        out.append({"test_id":s.test_id,"score":s.score,"accuracy":s.accuracy,"time_taken":s.time_taken,"created_at":s.created_at.isoformat()})
    return out
