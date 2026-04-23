import numpy as np
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestRegressor, IsolationForest

from app.models import QuestionLog, TestAttempt


def build_user_features(db):
  attempts = db.query(TestAttempt).all()
  features = []
  for attempt in attempts:
    logs = db.query(QuestionLog).filter(QuestionLog.attempt_id == attempt.id).all()
    if not logs:
      continue
    total = len(logs)
    correct = sum(1 for l in logs if l.is_correct)
    avg_time = sum(l.time_taken for l in logs) / total
    change_rate = sum(1 for l in logs if l.changed_answer) / total
    features.append({
      "user_id": attempt.user_id,
      "accuracy": correct / total,
      "avg_time": avg_time,
      "change_rate": change_rate
    })
  return features


def predict_score_and_pass(db, user_id: int):
  rows = build_user_features(db)
  if len(rows) < 3:
    return {"predicted_score": 62.0, "pass_probability": 0.58}
  x = np.array([[r["accuracy"], r["avg_time"], r["change_rate"]] for r in rows])
  y = np.array([70 * r["accuracy"] + max(0, 25 - r["avg_time"]) for r in rows])
  model = RandomForestRegressor(n_estimators=50, random_state=42)
  model.fit(x, y)
  target = [r for r in rows if r["user_id"] == user_id]
  if not target:
    return {"predicted_score": float(np.mean(y)), "pass_probability": 0.5}
  pred = float(model.predict(np.array([[target[0]["accuracy"], target[0]["avg_time"], target[0]["change_rate"]]]))[0])
  pass_probability = min(max(pred / 100, 0), 1)
  return {"predicted_score": pred, "pass_probability": pass_probability}


def cluster_users(db):
  rows = build_user_features(db)
  if len(rows) < 3:
    return [{"user_id": r["user_id"], "cluster": 0} for r in rows]
  x = np.array([[r["accuracy"], r["avg_time"]] for r in rows])
  km = KMeans(n_clusters=3, random_state=42, n_init="auto")
  labels = km.fit_predict(x)
  return [{"user_id": rows[idx]["user_id"], "cluster": int(label)} for idx, label in enumerate(labels)]


def anomalies_for_user(db, user_id: int):
  logs = db.query(QuestionLog).join(TestAttempt, QuestionLog.attempt_id == TestAttempt.id).filter(TestAttempt.user_id == user_id).all()
  if len(logs) < 6:
    return {"flags": []}
  x = np.array([[l.time_taken, 1 if l.changed_answer else 0, 1 if l.is_correct else 0] for l in logs])
  model = IsolationForest(contamination=0.2, random_state=42)
  pred = model.fit_predict(x)
  outliers = np.where(pred == -1)[0].tolist()
  flags = []
  if outliers:
    flags.append("Inconsistent response pattern detected")
  fast_wrong = [l for l in logs if l.time_taken < 4 and not l.is_correct]
  if len(fast_wrong) >= 3:
    flags.append("Rapid guessing behavior detected")
  return {"flags": flags}
