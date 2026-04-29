import json
from datetime import datetime
from pathlib import Path
from ..security import hash_password, verify_password

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
USERS_FILE = DATA_DIR / "users.json"


def now():
    return datetime.utcnow().isoformat()


def read_users():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not USERS_FILE.exists():
        USERS_FILE.write_text("[]", encoding="utf-8")
    return json.loads(USERS_FILE.read_text(encoding="utf-8"))


def write_users(users):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    USERS_FILE.write_text(json.dumps(users, indent=2), encoding="utf-8")


def public_user(user):
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user["created_at"],
        "last_login": user.get("last_login"),
        "status": user.get("status", "offline")
    }


def ensure_demo_users():
    users = read_users()
    if not any(user["email"] == "student@assessiq.dev" for user in users):
        users.append({
            "id": 1,
            "name": "Demo Student",
            "email": "student@assessiq.dev",
            "password_hash": hash_password("student123"),
            "role": "student",
            "created_at": now(),
            "last_login": None,
            "status": "offline"
        })
    if not any(user["email"] == "teacher@assessiq.dev" for user in users):
        users.append({
            "id": 2,
            "name": "Demo Teacher",
            "email": "teacher@assessiq.dev",
            "password_hash": hash_password("teacher123"),
            "role": "teacher",
            "created_at": now(),
            "last_login": None,
            "status": "offline"
        })
    write_users(users)


def find_user(email):
    email = email.lower()
    return next((user for user in read_users() if user["email"].lower() == email), None)


def create_user(name, email, password, role):
    users = read_users()
    email = email.lower()
    if any(user["email"].lower() == email for user in users):
        return None
    next_id = max([user["id"] for user in users], default=0) + 1
    user = {
        "id": next_id,
        "name": name,
        "email": email,
        "password_hash": hash_password(password),
        "role": role,
        "created_at": now(),
        "last_login": now(),
        "status": "online"
    }
    users.append(user)
    write_users(users)
    return user


def authenticate(email, password):
    users = read_users()
    email = email.lower()
    for user in users:
        if user["email"].lower() == email and verify_password(password, user["password_hash"]):
            user["last_login"] = now()
            user["status"] = "online"
            write_users(users)
            return user
    return None


def reset_password(email, new_password):
    users = read_users()
    email = email.lower()
    for user in users:
        if user["email"].lower() == email:
            user["password_hash"] = hash_password(new_password)
            user["last_login"] = None
            user["status"] = "offline"
            write_users(users)
            return user
    return None


def list_public_users():
    return [public_user(user) for user in read_users()]

