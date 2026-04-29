from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(30), default="student")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    attempts: Mapped[list["Attempt"]] = relationship(back_populates="user")


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    text: Mapped[str] = mapped_column(Text)
    option_a: Mapped[str] = mapped_column(String(255))
    option_b: Mapped[str] = mapped_column(String(255))
    option_c: Mapped[str] = mapped_column(String(255))
    option_d: Mapped[str] = mapped_column(String(255))
    correct_option: Mapped[str] = mapped_column(String(1))
    explanation: Mapped[str] = mapped_column(Text)
    topic: Mapped[str] = mapped_column(String(120), index=True)
    subtopic: Mapped[str] = mapped_column(String(120), default="")
    difficulty: Mapped[int] = mapped_column(Integer, index=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class Test(Base):
    __tablename__ = "tests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(160))
    mode: Mapped[str] = mapped_column(String(40), default="adaptive")
    time_limit_minutes: Mapped[int] = mapped_column(Integer, default=30)
    question_limit: Mapped[int] = mapped_column(Integer, default=10)
    initial_difficulty: Mapped[int] = mapped_column(Integer, default=2)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    attempts: Mapped[list["Attempt"]] = relationship(back_populates="test")


class Attempt(Base):
    __tablename__ = "attempts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    test_id: Mapped[int] = mapped_column(ForeignKey("tests.id"), index=True)
    status: Mapped[str] = mapped_column(String(40), default="active")
    score: Mapped[float] = mapped_column(Float, default=0)
    current_difficulty: Mapped[int] = mapped_column(Integer, default=2)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship(back_populates="attempts")
    test: Mapped["Test"] = relationship(back_populates="attempts")
    logs: Mapped[list["AttemptLog"]] = relationship(back_populates="attempt")


class AttemptLog(Base):
    __tablename__ = "attempt_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("attempts.id"), index=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id"), index=True)
    selected_option: Mapped[str] = mapped_column(String(1))
    is_correct: Mapped[bool] = mapped_column(Boolean)
    time_taken: Mapped[float] = mapped_column(Float)
    revisit_count: Mapped[int] = mapped_column(Integer, default=0)
    answer_changes: Mapped[int] = mapped_column(Integer, default=0)
    tab_switches: Mapped[int] = mapped_column(Integer, default=0)
    inactivity_seconds: Mapped[float] = mapped_column(Float, default=0)
    difficulty_before: Mapped[int] = mapped_column(Integer)
    difficulty_after: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    attempt: Mapped["Attempt"] = relationship(back_populates="logs")
    question: Mapped["Question"] = relationship()

