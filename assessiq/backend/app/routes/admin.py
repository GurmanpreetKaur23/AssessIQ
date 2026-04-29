from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import require_teacher
from ..models import Question, Test, User
from ..schemas import QuestionIn, TestIn

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/questions")
def list_questions(db: Session = Depends(get_db), user: User = Depends(require_teacher)):
    questions = db.query(Question).order_by(Question.id.desc()).all()
    return [{
        "id": q.id,
        "text": q.text,
        "options": [q.option_a, q.option_b, q.option_c, q.option_d],
        "correct_option": q.correct_option,
        "topic": q.topic,
        "subtopic": q.subtopic,
        "difficulty": q.difficulty,
        "active": q.active
    } for q in questions]


@router.post("/questions")
def create_question(data: QuestionIn, db: Session = Depends(get_db), user: User = Depends(require_teacher)):
    q = Question(
        text=data.text,
        option_a=data.options[0],
        option_b=data.options[1],
        option_c=data.options[2],
        option_d=data.options[3],
        correct_option=data.correct_option.upper(),
        explanation=data.explanation,
        topic=data.topic,
        subtopic=data.subtopic,
        difficulty=data.difficulty,
        active=data.active
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return {"id": q.id}


@router.put("/questions/{question_id}")
def update_question(question_id: int, data: QuestionIn, db: Session = Depends(get_db), user: User = Depends(require_teacher)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    q.text = data.text
    q.option_a = data.options[0]
    q.option_b = data.options[1]
    q.option_c = data.options[2]
    q.option_d = data.options[3]
    q.correct_option = data.correct_option.upper()
    q.explanation = data.explanation
    q.topic = data.topic
    q.subtopic = data.subtopic
    q.difficulty = data.difficulty
    q.active = data.active
    db.commit()
    return {"updated": True}


@router.delete("/questions/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db), user: User = Depends(require_teacher)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(q)
    db.commit()
    return {"deleted": True}


@router.post("/tests")
def create_test(data: TestIn, db: Session = Depends(get_db), user: User = Depends(require_teacher)):
    test = Test(title=data.title, mode=data.mode, time_limit_minutes=data.time_limit_minutes, question_limit=data.question_limit, initial_difficulty=data.initial_difficulty)
    db.add(test)
    db.commit()
    db.refresh(test)
    return {"id": test.id}

