from typing import List
from pydantic import BaseModel, EmailStr


class RegisterIn(BaseModel):
  name: str
  email: EmailStr
  password: str
  role: str = "student"


class LoginIn(BaseModel):
  email: EmailStr
  password: str


class StartTestIn(BaseModel):
  user_id: int
  mode: str = "adaptive"
  total_questions: int = 10


class SubmitAnswerIn(BaseModel):
  attempt_id: int
  question_id: int
  answer: str
  time_taken: float
  changed_answer: bool = False


class BehaviorIn(BaseModel):
  attempt_id: int
  event_type: str


class QuestionIn(BaseModel):
  prompt: str
  options: List[str]
  correct_answer: str
  topic: str
  subtopic: str
  difficulty: int


class PredictIn(BaseModel):
  user_id: int
