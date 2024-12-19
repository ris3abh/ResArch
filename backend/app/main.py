from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import API_TITLE, API_DESCRIPTION, VERSION, API_V1_STR, BACKEND_CORS_ORIGINS
from app.core.database import engine
from app.models import Base
from app.api.v1 import api_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=VERSION,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to Resume Architect API"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": VERSION
    }