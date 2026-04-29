from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import get_current_user
from ..models import Attempt, AttemptLog, Question, Test, User
from ..schemas import AnswerIn, QuestionOut, StartTestIn
from ..services.adaptive import next_difficulty, select_question

router = APIRouter(prefix="/tests", tags=["tests"])


def question_out(question: Question, include_explanation=False):
    return QuestionOut(
        id=question.id,
        text=question.text,
        options=[question.option_a, question.option_b, question.option_c, question.option_d],
        topic=question.topic,
        subtopic=question.subtopic,
        difficulty=question.difficulty,
        explanation=question.explanation if include_explanation else None
    )


@router.get("")
def list_tests(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    tests = db.query(Test).order_by(Test.id.asc()).all()
    return [{"id": test.id, "title": test.title, "mode": test.mode, "time_limit_minutes": test.time_limit_minutes, "question_limit": test.question_limit} for test in tests]


@router.post("/start")
def start_test(data: StartTestIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    test = db.query(Test).filter(Test.id == data.test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    active = db.query(Attempt).filter(Attempt.user_id == user.id, Attempt.test_id == test.id, Attempt.status == "active").first()
    if active:
        used = [log.question_id for log in active.logs]
        question = select_question(db, Question, used, active.current_difficulty)
        return {"attempt_id": active.id, "resumed": True, "question": question_out(question) if question else None, "time_limit_minutes": test.time_limit_minutes}
    attempt = Attempt(user_id=user.id, test_id=test.id, current_difficulty=test.initial_difficulty)
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    question = select_question(db, Question, [], attempt.current_difficulty)
    return {"attempt_id": attempt.id, "resumed": False, "question": question_out(question) if question else None, "time_limit_minutes": test.time_limit_minutes}


@router.post("/answer")
def submit_answer(data: AnswerIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    attempt = db.query(Attempt).filter(Attempt.id == data.attempt_id, Attempt.user_id == user.id).first()
    if not attempt or attempt.status != "active":
        raise HTTPException(status_code=404, detail="Active attempt not found")
    question = db.query(Question).filter(Question.id == data.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    is_correct = data.selected_option.upper() == question.correct_option.upper()
    after = next_difficulty(attempt.current_difficulty, is_correct, data.time_taken, data.revisit_count, data.answer_changes)
    log = AttemptLog(
        attempt_id=attempt.id,
        question_id=question.id,
        selected_option=data.selected_option.upper(),
        is_correct=is_correct,
        time_taken=data.time_taken,
        revisit_count=data.revisit_count,
        answer_changes=data.answer_changes,
        tab_switches=data.tab_switches,
        inactivity_seconds=data.inactivity_seconds,
        difficulty_before=attempt.current_difficulty,
        difficulty_after=after
    )
    db.add(log)
    attempt.current_difficulty = after
    db.commit()
    db.refresh(attempt)
    logs = db.query(AttemptLog).filter(AttemptLog.attempt_id == attempt.id).all()
    test = db.query(Test).filter(Test.id == attempt.test_id).first()
    if len(logs) >= test.question_limit:
        attempt.status = "completed"
        attempt.completed_at = datetime.utcnow()
        attempt.score = round(100 * sum(1 for item in logs if item.is_correct) / len(logs), 2)
        db.commit()
        return {"completed": True, "is_correct": is_correct, "explanation": question.explanation, "score": attempt.score, "next_question": None, "difficulty": after}
    used = [item.question_id for item in logs]
    next_question = select_question(db, Question, used, after)
    return {"completed": False, "is_correct": is_correct, "explanation": question.explanation, "score": attempt.score, "next_question": question_out(next_question) if next_question else None, "difficulty": after}


@router.post("/{attempt_id}/finish")
def finish_test(attempt_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    attempt = db.query(Attempt).filter(Attempt.id == attempt_id, Attempt.user_id == user.id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    logs = db.query(AttemptLog).filter(AttemptLog.attempt_id == attempt.id).all()
    attempt.status = "completed"
    attempt.completed_at = datetime.utcnow()
    attempt.score = round(100 * sum(1 for item in logs if item.is_correct) / len(logs), 2) if logs else 0
    db.commit()
    return {"score": attempt.score, "status": attempt.status}

