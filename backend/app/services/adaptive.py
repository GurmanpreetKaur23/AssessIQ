def next_difficulty(current: int, is_correct: bool, time_taken: float) -> int:
  if is_correct and time_taken <= 25:
    return min(5, current + 1)
  if (not is_correct) and time_taken > 35:
    return max(1, current - 1)
  if not is_correct:
    return max(1, current - 1)
  return current
