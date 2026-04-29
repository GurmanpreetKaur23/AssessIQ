from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Question, QuestionLog, TestAttempt, User
from app.schemas import QuestionIn

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/questions")
def add_question(payload: QuestionIn, db: Session = Depends(get_db)):
  opts = payload.options[:4]
  while len(opts) < 4:
    opts.append("")
  q = Question(
    prompt=payload.prompt,
    topic=payload.topic,
    subtopic=payload.subtopic,
    difficulty=payload.difficulty,
    option_a=opts[0],
    option_b=opts[1],
    option_c=opts[2],
    option_d=opts[3],
    correct_answer=payload.correct_answer
  )
  db.add(q)
  db.commit()
  db.refresh(q)
  return {"id": q.id}


@router.get("/questions")
def list_questions(db: Session = Depends(get_db)):
  items = db.query(Question).order_by(Question.id.desc()).all()
  return [{
    "id": q.id,
    "prompt": q.prompt,
    "topic": q.topic,
    "difficulty": q.difficulty
  } for q in items]


@router.get("/student-stats")
def student_stats(db: Session = Depends(get_db)):
  students = db.query(User).filter(User.role == "student").count()
  logs = db.query(QuestionLog).all()
  total = len(logs)
  avg_accuracy = (sum(1 for l in logs if l.is_correct) / total) if total else 0
  attempts = db.query(TestAttempt).all()
  dropoff = (sum(1 for a in attempts if not a.completed) / len(attempts)) if attempts else 0
  weak = db.execute(
    text(
      "SELECT q.topic, AVG(CASE WHEN l.is_correct = 1 THEN 1.0 ELSE 0.0 END) as acc "
      "FROM question_logs l JOIN questions q ON l.question_id = q.id GROUP BY q.topic ORDER BY acc ASC"
    )
  ).fetchone()
  weak_topic = weak[0] if weak else "N/A"
  return {
    "total_students": students,
    "avg_accuracy": avg_accuracy,
    "dropoff_rate": dropoff,
    "weak_topic": weak_topic
  }
