from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, SessionLocal, engine
from app.routers import admin, analytics, auth, ml, test
from app.seed import seed_questions

app = FastAPI(title="AssessIQ API")

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
  seed_questions(db)

app.include_router(auth.router)
app.include_router(test.router)
app.include_router(analytics.router)
app.include_router(ml.router)
app.include_router(admin.router)


@app.get("/")
def home():
  return {"name": "AssessIQ", "status": "running"}
