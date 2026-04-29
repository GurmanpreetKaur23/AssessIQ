import math
import numpy as np
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest, RandomForestRegressor


def predict_score(samples, features):
    if len(samples) >= 8:
        x = np.array([[s["accuracy"], s["avg_time"], s["avg_difficulty"], s["answer_changes"], s["tab_switches"]] for s in samples])
        y = np.array([s["score"] for s in samples])
        model = RandomForestRegressor(n_estimators=80, random_state=7)
        model.fit(x, y)
        return float(model.predict([features])[0])
    accuracy, avg_time, avg_difficulty, answer_changes, tab_switches = features
    speed_factor = max(0, 1 - avg_time / 180)
    behavior_penalty = min(20, answer_changes * 1.5 + tab_switches * 3)
    return max(0, min(100, accuracy * 72 + speed_factor * 18 + avg_difficulty * 4 - behavior_penalty))


def pass_probability(score):
    return round(1 / (1 + math.exp(-(score - 55) / 10)), 2)


def cluster_students(rows):
    if len(rows) < 3:
        return [{"user_id": row["user_id"], "cluster": "building profile"} for row in rows]
    x = np.array([[row["accuracy"], row["avg_time"], row["answer_changes"]] for row in rows])
    labels = KMeans(n_clusters=3, n_init="auto", random_state=9).fit_predict(x)
    centers = {}
    for label in set(labels):
        members = x[labels == label]
        centers[label] = members.mean(axis=0)
    names = {}
    for label, center in centers.items():
        if center[0] > 0.7 and center[1] < 55:
            names[label] = "fast learner"
        elif center[0] > 0.65:
            names[label] = "slow but accurate"
        else:
            names[label] = "guesser"
    return [{"user_id": row["user_id"], "cluster": names[label]} for row, label in zip(rows, labels)]


def anomaly_flags(rows):
    if len(rows) < 6:
        return []
    x = np.array([[row["accuracy"], row["avg_time"], row["answer_changes"], row["tab_switches"]] for row in rows])
    model = IsolationForest(contamination=0.15, random_state=10)
    labels = model.fit_predict(x)
    return [rows[index]["user_id"] for index, label in enumerate(labels) if label == -1]

