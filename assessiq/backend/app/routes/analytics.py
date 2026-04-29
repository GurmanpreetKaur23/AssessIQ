from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from ..deps import get_current_user, require_teacher
from ..models import Attempt, AttemptLog, Question, User
from ..services.analytics import build_student_analytics, recommendations
from ..services.ml import anomaly_flags, cluster_students

router = APIRouter(prefix="/analytics", tags=["analytics"])


def rows_for_students(db: Session):
    rows = []
    users = db.query(User).filter(User.role == "student").all()
    for user in users:
        logs = db.query(AttemptLog).join(Attempt).filter(Attempt.user_id == user.id).all()
        if not logs:
            continue
        rows.append({
            "user_id": user.id,
            "accuracy": sum(1 for log in logs if log.is_correct) / len(logs),
            "avg_time": sum(log.time_taken for log in logs) / len(logs),
            "answer_changes": sum(log.answer_changes for log in logs),
            "tab_switches": sum(log.tab_switches for log in logs)
        })
    return rows


@router.get("/me")
def my_analytics(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    logs = db.query(AttemptLog).join(Attempt).options(joinedload(AttemptLog.question)).filter(Attempt.user_id == user.id).all()
    data = build_student_analytics(logs)
    data["recommendations"] = recommendations(data)
    return data


@router.get("/attempt/{attempt_id}")
def attempt_analytics(attempt_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    attempt = db.query(Attempt).filter(Attempt.id == attempt_id, Attempt.user_id == user.id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    logs = db.query(AttemptLog).options(joinedload(AttemptLog.question)).filter(AttemptLog.attempt_id == attempt.id).all()
    data = build_student_analytics(logs)
    data["score"] = attempt.score
    data["recommendations"] = recommendations(data)
    return data


@router.get("/admin")
def admin_analytics(db: Session = Depends(get_db), user: User = Depends(require_teacher)):
    rows = rows_for_students(db)
    weak_topics = {}
    logs = db.query(AttemptLog).options(joinedload(AttemptLog.question)).all()
    for log in logs:
        topic = log.question.topic
        if topic not in weak_topics:
            weak_topics[topic] = {"total": 0, "correct": 0}
        weak_topics[topic]["total"] += 1
        weak_topics[topic]["correct"] += int(log.is_correct)
    topics = [{"topic": topic, "accuracy": round(data["correct"] / data["total"], 2)} for topic, data in weak_topics.items()]
    return {
        "students": len(rows),
        "clusters": cluster_students(rows),
        "anomalies": anomaly_flags(rows),
        "weak_topics": sorted(topics, key=lambda item: item["accuracy"])
    }

