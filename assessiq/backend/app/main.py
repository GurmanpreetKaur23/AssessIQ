from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, SessionLocal, engine
from .routes import admin, analytics, auth, ml, tests
from .seed import seed

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    seed(db)
finally:
    db.close()

app = FastAPI(title="AssessIQ API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth.router)
app.include_router(tests.router)
app.include_router(analytics.router)
app.include_router(ml.router)
app.include_router(admin.router)


@app.get("/")
def health():
    return {"name": "AssessIQ", "status": "ready"}

