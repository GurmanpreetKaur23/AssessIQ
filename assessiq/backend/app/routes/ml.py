from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import get_current_user
from ..models import Attempt, AttemptLog, User
from ..schemas import PredictionIn
from ..services.ml import pass_probability, predict_score

router = APIRouter(prefix="/ml", tags=["ml"])


@router.post("/predict-performance")
def predict_performance(data: PredictionIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    attempts = db.query(Attempt).all()
    samples = []
    for attempt in attempts:
        logs = db.query(AttemptLog).filter(AttemptLog.attempt_id == attempt.id).all()
        if not logs:
            continue
        samples.append({
            "accuracy": sum(1 for log in logs if log.is_correct) / len(logs),
            "avg_time": sum(log.time_taken for log in logs) / len(logs),
            "avg_difficulty": sum(log.difficulty_before for log in logs) / len(logs),
            "answer_changes": sum(log.answer_changes for log in logs),
            "tab_switches": sum(log.tab_switches for log in logs),
            "score": attempt.score
        })
    features = [data.accuracy, data.avg_time, data.avg_difficulty, data.answer_changes, data.tab_switches]
    score = round(predict_score(samples, features), 2)
    return {"predicted_score": score, "pass_probability": pass_probability(score)}

