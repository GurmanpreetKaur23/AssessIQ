from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: str = "student"


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordIn(BaseModel):
    email: EmailStr
    new_password: str = Field(min_length=6)


class QuestionIn(BaseModel):
    text: str
    options: list[str] = Field(min_length=4, max_length=4)
    correct_option: str
    explanation: str
    topic: str
    subtopic: str = ""
    difficulty: int = Field(ge=1, le=5)
    active: bool = True


class QuestionOut(BaseModel):
    id: int
    text: str
    options: list[str]
    topic: str
    subtopic: str
    difficulty: int
    explanation: str | None = None


class TestIn(BaseModel):
    title: str
    mode: str = "adaptive"
    time_limit_minutes: int = Field(default=30, ge=1, le=180)
    question_limit: int = Field(default=10, ge=1, le=100)
    initial_difficulty: int = Field(default=2, ge=1, le=5)


class StartTestIn(BaseModel):
    test_id: int = 1


class AnswerIn(BaseModel):
    attempt_id: int
    question_id: int
    selected_option: str
    time_taken: float
    revisit_count: int = 0
    answer_changes: int = 0
    tab_switches: int = 0
    inactivity_seconds: float = 0


class PredictionIn(BaseModel):
    accuracy: float = Field(ge=0, le=1)
    avg_time: float = Field(ge=0)
    avg_difficulty: float = Field(ge=1, le=5)
    answer_changes: int = 0
    tab_switches: int = 0


class AttemptSummary(BaseModel):
    id: int
    score: float
    status: str
    started_at: datetime
    completed_at: datetime | None
