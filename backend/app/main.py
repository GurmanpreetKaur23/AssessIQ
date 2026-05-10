from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.routes import auth_routes,test_routes,analytics_routes,events_routes
from app.database import Base,engine
Base.metadata.create_all(bind=engine)
app=FastAPI()
origins=[os.getenv("FRONTEND_URL","*")]
app.add_middleware(CORSMiddleware,allow_origins=origins,allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
app.include_router(auth_routes.router,prefix="/auth")
app.include_router(test_routes.router,prefix="/tests")
app.include_router(analytics_routes.router,prefix="/analytics")
app.include_router(events_routes.router,prefix="/events")
