from fastapi import FastAPI
from app.routes import auth_routes,test_routes,analytics_routes
from app.database import Base,engine
Base.metadata.create_all(bind=engine)
app=FastAPI()
app.include_router(auth_routes.router,prefix="/auth")
app.include_router(test_routes.router,prefix="/tests")
app.include_router(analytics_routes.router,prefix="/analytics")
