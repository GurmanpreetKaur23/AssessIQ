def next_difficulty(current: int, is_correct: bool, time_taken: float, revisit_count: int, answer_changes: int) -> int:
    signal = 0
    if is_correct:
        signal += 1
    else:
        signal -= 1
    if is_correct and time_taken <= 35 and answer_changes == 0:
        signal += 1
    if time_taken > 90 or revisit_count >= 2 or answer_changes >= 2:
        signal -= 1
    if signal >= 2:
        return min(current + 1, 5)
    if signal <= -1:
        return max(current - 1, 1)
    return current


def select_question(db, Question, used_ids: list[int], difficulty: int):
    query = db.query(Question).filter(Question.active == True, Question.difficulty == difficulty, ~Question.id.in_(used_ids))
    question = query.order_by(Question.id.asc()).first()
    if question:
        return question
    return db.query(Question).filter(Question.active == True, ~Question.id.in_(used_ids)).order_by(Question.difficulty.asc(), Question.id.asc()).first()

