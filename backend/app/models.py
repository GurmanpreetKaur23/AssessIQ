from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
  __tablename__ = "users"
  id = Column(Integer, primary_key=True, index=True)
  name = Column(String, nullable=False)
  email = Column(String, unique=True, index=True, nullable=False)
  password_hash = Column(String, nullable=False)
  role = Column(String, default="student", nullable=False)
  attempts = relationship("TestAttempt", back_populates="user")


class Question(Base):
  __tablename__ = "questions"
  id = Column(Integer, primary_key=True, index=True)
  prompt = Column(String, nullable=False)
  topic = Column(String, nullable=False)
  subtopic = Column(String, nullable=False)
  difficulty = Column(Integer, nullable=False)
  option_a = Column(String, nullable=False)
  option_b = Column(String, nullable=False)
  option_c = Column(String, nullable=False)
  option_d = Column(String, nullable=False)
  correct_answer = Column(String, nullable=False)


class TestAttempt(Base):
  __tablename__ = "test_attempts"
  id = Column(Integer, primary_key=True, index=True)
  user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
  mode = Column(String, default="adaptive")
  total_questions = Column(Integer, default=10)
  answered_questions = Column(Integer, default=0)
  current_difficulty = Column(Integer, default=2)
  completed = Column(Boolean, default=False)
  user = relationship("User", back_populates="attempts")
  logs = relationship("QuestionLog", back_populates="attempt")


class QuestionLog(Base):
  __tablename__ = "question_logs"
  id = Column(Integer, primary_key=True, index=True)
  attempt_id = Column(Integer, ForeignKey("test_attempts.id"), nullable=False)
  question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
  answer = Column(String, nullable=False)
  is_correct = Column(Boolean, nullable=False)
  time_taken = Column(Float, nullable=False)
  changed_answer = Column(Boolean, default=False)
  revisit = Column(Boolean, default=False)
  attempt = relationship("TestAttempt", back_populates="logs")
  question = relationship("Question")


class BehaviorEvent(Base):
  __tablename__ = "behavior_events"
  id = Column(Integer, primary_key=True, index=True)
  attempt_id = Column(Integer, ForeignKey("test_attempts.id"), nullable=False)
  event_type = Column(String, nullable=False)
