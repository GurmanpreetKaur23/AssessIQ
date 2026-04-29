from .models import Question, Test, User
from .security import hash_password
from .services.user_store import ensure_demo_users, find_user


def seed(db):
    ensure_demo_users()
    if not db.query(User).filter(User.email == "student@assessiq.dev").first():
        user = find_user("student@assessiq.dev")
        db.add(User(id=user["id"], name=user["name"], email=user["email"], password_hash=user["password_hash"], role=user["role"]))
    if not db.query(User).filter(User.email == "teacher@assessiq.dev").first():
        user = find_user("teacher@assessiq.dev")
        db.add(User(id=user["id"], name=user["name"], email=user["email"], password_hash=user["password_hash"], role=user["role"]))
    if not db.query(Test).first():
        db.add(Test(title="Adaptive Olympiad Diagnostic", mode="adaptive", time_limit_minutes=25, question_limit=8, initial_difficulty=2))
    if not db.query(Question).first():
        rows = [
            ("What is 18 + 27?", ["35", "45", "55", "40"], "B", "Add tens and ones separately: 10+20 and 8+7.", "Arithmetic", "Addition", 1),
            ("If x + 9 = 21, what is x?", ["10", "11", "12", "13"], "C", "Subtract 9 from both sides.", "Algebra", "Linear equations", 1),
            ("A triangle has angles 50 and 60 degrees. Find the third angle.", ["60", "70", "80", "90"], "B", "Angles in a triangle add to 180 degrees.", "Geometry", "Angles", 2),
            ("What is 15 percent of 200?", ["15", "20", "25", "30"], "D", "15 percent of 200 is 0.15 multiplied by 200.", "Arithmetic", "Percentages", 2),
            ("Solve: 3x - 4 = 20", ["6", "7", "8", "9"], "C", "Add 4 then divide by 3.", "Algebra", "Linear equations", 3),
            ("The area of a circle with radius 7 is closest to which value?", ["44", "88", "154", "308"], "C", "Use pi r squared with pi near 22/7.", "Geometry", "Circles", 3),
            ("Find the next term: 2, 6, 12, 20, 30", ["36", "40", "42", "44"], "C", "Differences are 4, 6, 8, 10, so add 12.", "Reasoning", "Sequences", 4),
            ("How many distinct arrangements are possible for the letters in LEVEL?", ["20", "30", "40", "60"], "B", "Use 5 factorial divided by 2 factorial and 2 factorial.", "Combinatorics", "Permutations", 4),
            ("If a function f(x)=x^2-3x+2, find f(5).", ["10", "11", "12", "14"], "C", "25 minus 15 plus 2 equals 12.", "Algebra", "Functions", 5),
            ("A bag has 3 red, 4 blue, and 5 green balls. Probability of not blue?", ["1/3", "1/2", "2/3", "3/4"], "C", "Not blue means 8 favorable out of 12 total.", "Probability", "Basic probability", 5)
        ]
        for text, options, correct, explanation, topic, subtopic, difficulty in rows:
            db.add(Question(text=text, option_a=options[0], option_b=options[1], option_c=options[2], option_d=options[3], correct_option=correct, explanation=explanation, topic=topic, subtopic=subtopic, difficulty=difficulty))
    db.commit()
