from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import BehaviorEvent, QuestionLog, TestAttempt

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/student/{user_id}")
def student_analytics(user_id: int, db: Session = Depends(get_db)):
  attempts = db.query(TestAttempt).filter(TestAttempt.user_id == user_id).all()
  logs = db.query(QuestionLog).join(TestAttempt, QuestionLog.attempt_id == TestAttempt.id).filter(TestAttempt.user_id == user_id).all()
  total = len(logs)
  if total == 0:
    return {"accuracy": 0, "avg_time": 0, "guessing_rate": 0, "change_rate": 0, "revisit_rate": 0}
  correct = sum(1 for l in logs if l.is_correct)
  avg_time = sum(l.time_taken for l in logs) / total
  guessing = sum(1 for l in logs if (l.time_taken < 4 and not l.is_correct)) / total
  changes = sum(1 for l in logs if l.changed_answer) / total
  events = db.query(BehaviorEvent).join(TestAttempt, BehaviorEvent.attempt_id == TestAttempt.id).filter(TestAttempt.user_id == user_id, BehaviorEvent.event_type == "revisit").all()
  revisit_rate = len(events) / max(len(attempts), 1)
  return {"accuracy": correct / total, "avg_time": avg_time, "guessing_rate": guessing, "change_rate": changes, "revisit_rate": revisit_rate}


@router.get("/timeline/{user_id}")
def timeline(user_id: int, db: Session = Depends(get_db)):
  attempts = db.query(TestAttempt).filter(TestAttempt.user_id == user_id, TestAttempt.completed == True).all()
  out = []
  for i, at in enumerate(attempts, start=1):
    logs = db.query(QuestionLog).filter(QuestionLog.attempt_id == at.id).all()
    total = len(logs)
    if total == 0:
      continue
    score = 100 * (sum(1 for l in logs if l.is_correct) / total)
    out.append({"attempt": i, "score": round(score, 2)})
  return out
