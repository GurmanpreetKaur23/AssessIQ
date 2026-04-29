from sqlalchemy.orm import Session

from app.models import Question


def seed_questions(db: Session):
  if db.query(Question).count() > 0:
    return
  rows = [
    ("2x + 5 = 13, x=?", "Algebra", "Linear", 1, "2", "3", "4", "5", "4"),
    ("If a triangle has sides 3,4,5 then area?", "Geometry", "Triangles", 2, "6", "7", "8", "9", "6"),
    ("12^2 equals", "Algebra", "Powers", 3, "124", "132", "144", "154", "144"),
    ("Number of diagonals in hexagon", "Geometry", "Polygons", 4, "6", "9", "12", "15", "9"),
    ("Find remainder 2^10 mod 7", "Number Theory", "Modulo", 5, "1", "2", "3", "4", "2")
  ]
  for r in rows:
    db.add(Question(
      prompt=r[0], topic=r[1], subtopic=r[2], difficulty=r[3],
      option_a=r[4], option_b=r[5], option_c=r[6], option_d=r[7], correct_answer=r[8]
    ))
  db.commit()
