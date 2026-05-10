from sqlalchemy import Column,Integer,String,Float,Boolean,ForeignKey,Text,DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
Base=declarative_base()
class User(Base):
    __tablename__="users"
    id=Column(Integer,primary_key=True,index=True)
    email=Column(String,unique=True,index=True,nullable=False)
    hashed_password=Column(String,nullable=True)
    full_name=Column(String,nullable=True)
    is_active=Column(Boolean,default=True)
    is_verified=Column(Boolean,default=False)
    role=Column(String,default="student")
    created_at=Column(DateTime,default=datetime.utcnow)
    submissions=relationship("Submission",back_populates="user")
class Test(Base):
    __tablename__="tests"
    id=Column(Integer,primary_key=True,index=True)
    title=Column(String,nullable=False)
    description=Column(Text,nullable=True)
    created_at=Column(DateTime,default=datetime.utcnow)
    questions=relationship("Question",back_populates="test")
class Question(Base):
    __tablename__="questions"
    id=Column(Integer,primary_key=True,index=True)
    test_id=Column(Integer,ForeignKey("tests.id"))
    prompt=Column(Text,nullable=False)
    difficulty=Column(String,default="medium")
    topic=Column(String,nullable=True)
    correct_answer=Column(String,nullable=True)
    test=relationship("Test",back_populates="questions")
class Submission(Base):
    __tablename__="submissions"
    id=Column(Integer,primary_key=True,index=True)
    user_id=Column(Integer,ForeignKey("users.id"))
    test_id=Column(Integer,ForeignKey("tests.id"))
    answers=Column(Text)
    score=Column(Float,default=0.0)
    accuracy=Column(Float,default=0.0)
    time_taken=Column(Float,default=0.0)
    created_at=Column(DateTime,default=datetime.utcnow)
    user=relationship("User",back_populates="submissions")
