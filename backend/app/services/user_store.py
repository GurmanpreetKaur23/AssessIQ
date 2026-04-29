import json
from pathlib import Path

from app.models import User


def export_users_to_json(db):
  users = db.query(User).order_by(User.id.asc()).all()
  rows = [
    {
      "id": user.id,
      "name": user.name,
      "email": user.email,
      "role": user.role
    }
    for user in users
  ]
  base = Path(__file__).resolve().parents[2]
  data_dir = base / "data"
  data_dir.mkdir(parents=True, exist_ok=True)
  output = data_dir / "users.json"
  output.write_text(json.dumps(rows, indent=2), encoding="utf-8")
