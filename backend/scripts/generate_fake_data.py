import random
import json
from pathlib import Path
Path("backend/data").mkdir(parents=True,exist_ok=True)
students=[]
for i in range(100):
    students.append({"id":i+1,"name":f"student_{i+1}","past_score":random.randint(30,95)})
with open("backend/data/students.json","w") as f:
    json.dump(students,f)
submissions=[]
for s in students:
    for t in range(5):
        submissions.append({"student_id":s["id"],"test_id":t+1,"score":max(0,min(100,int(random.gauss(s["past_score"],10)))),"time_taken":random.uniform(20,90)})
with open("backend/data/submissions.json","w") as f:
    json.dump(submissions,f)
