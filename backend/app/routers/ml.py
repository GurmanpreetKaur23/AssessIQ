from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import PredictIn
from app.services.ml_service import anomalies_for_user, cluster_users, predict_score_and_pass

router = APIRouter(prefix="/ml", tags=["ml"])


@router.post("/predict-performance")
def predict(payload: PredictIn, db: Session = Depends(get_db)):
  return predict_score_and_pass(db, payload.user_id)


@router.get("/recommend-topics/{user_id}")
def recommend_topics(user_id: int, db: Session = Depends(get_db)):
  rows = db.execute(
    text(
      "SELECT q.topic, AVG(CASE WHEN l.is_correct = 1 THEN 1.0 ELSE 0.0 END) as acc "
      "FROM question_logs l "
      "JOIN questions q ON l.question_id = q.id "
      "JOIN test_attempts t ON l.attempt_id = t.id "
      "WHERE t.user_id = :uid "
      "GROUP BY q.topic "
      "ORDER BY acc ASC"
    ),
    {"uid": user_id}
  ).fetchall()
  if not rows:
    return {"topics": ["Algebra", "Geometry"]}
  return {"topics": [r[0] for r in rows[:3]]}


@router.post("/cluster-students")
def clusters(db: Session = Depends(get_db)):
  return cluster_users(db)


@router.get("/anomaly/{user_id}")
def anomalies(user_id: int, db: Session = Depends(get_db)):
  return anomalies_for_user(db, user_id)
