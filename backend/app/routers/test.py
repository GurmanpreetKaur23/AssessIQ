from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import BehaviorEvent, Question, QuestionLog, TestAttempt
from app.schemas import BehaviorIn, StartTestIn, SubmitAnswerIn
from app.services.adaptive import next_difficulty

router = APIRouter(prefix="/test", tags=["test"])


def serialize_question(q: Question):
  return {
    "id": q.id,
    "prompt": q.prompt,
    "topic": q.topic,
    "subtopic": q.subtopic,
    "difficulty": q.difficulty,
    "options": [q.option_a, q.option_b, q.option_c, q.option_d]
  }


@router.post("/start")
def start_test(payload: StartTestIn, db: Session = Depends(get_db)):
  attempt = TestAttempt(user_id=payload.user_id, mode=payload.mode, total_questions=payload.total_questions)
  db.add(attempt)
  db.commit()
  db.refresh(attempt)
  q = db.query(Question).filter(Question.difficulty == 2).first()
  if not q:
    q = db.query(Question).first()
  if not q:
    raise HTTPException(status_code=404, detail="No questions in bank")
  return {"attempt_id": attempt.id, "first_question": serialize_question(q), "time_limit_seconds": 60}


@router.post("/submit-answer")
def submit_answer(payload: SubmitAnswerIn, db: Session = Depends(get_db)):
  attempt = db.query(TestAttempt).filter(TestAttempt.id == payload.attempt_id).first()
  question = db.query(Question).filter(Question.id == payload.question_id).first()
  if not attempt or not question:
    raise HTTPException(status_code=404, detail="Attempt or question not found")
  is_correct = payload.answer.strip().lower() == question.correct_answer.strip().lower()
  log = QuestionLog(
    attempt_id=attempt.id,
    question_id=question.id,
    answer=payload.answer,
    is_correct=is_correct,
    time_taken=payload.time_taken,
    changed_answer=payload.changed_answer
  )
  db.add(log)
  attempt.answered_questions += 1
  attempt.current_difficulty = next_difficulty(attempt.current_difficulty, is_correct, payload.time_taken)
  finished = attempt.answered_questions >= attempt.total_questions
  if finished:
    attempt.completed = True
    db.commit()
    return {"finished": True}
  next_q = db.query(Question).filter(Question.difficulty == attempt.current_difficulty).order_by(Question.id.desc()).first()
  if not next_q:
    next_q = db.query(Question).first()
  db.commit()
  return {"finished": False, "next_question": serialize_question(next_q), "difficulty": attempt.current_difficulty}


@router.post("/behavior")
def track_behavior(payload: BehaviorIn, db: Session = Depends(get_db)):
  event = BehaviorEvent(attempt_id=payload.attempt_id, event_type=payload.event_type)
  db.add(event)
  db.commit()
  return {"status": "recorded"}
