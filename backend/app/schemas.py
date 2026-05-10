from pydantic import BaseModel,EmailStr
from typing import List,Optional
class UserCreate(BaseModel):
    email:EmailStr
    password:str
    full_name:Optional[str]
    role:Optional[str]
class Token(BaseModel):
    access_token:str
    token_type:str
class UserOut(BaseModel):
    id:int
    email:EmailStr
    full_name:Optional[str]
    is_verified:bool
    role:str
    class Config:
        orm_mode=True
class TestCreate(BaseModel):
    title:str
    description:Optional[str]
class QuestionCreate(BaseModel):
    prompt:str
    difficulty:Optional[str]
    topic:Optional[str]
    correct_answer:Optional[str]
class SubmitPayload(BaseModel):
    test_id:int
    answers:List[str]
    time_taken:float
