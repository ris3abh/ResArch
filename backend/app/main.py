from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import API_TITLE, API_DESCRIPTION, VERSION, API_V1_STR, BACKEND_CORS_ORIGINS
from app.core.database import engine, SessionLocal
from app.models import Base
from app.api.v1 import api_router
from app.core.init_db import init_db
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=VERSION,
)

BACKEND_CORS_ORIGINS = [
    "http://localhost:5173",    # Vite dev server
    "http://localhost:3000",    # Next.js (if needed)
    "http://localhost:8000",    # FastAPI backend
]

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

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    try:
        db = SessionLocal()
        await init_db(db)  # This will call both template and skills initialization
        logger.info("Successfully initialized database")
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "Welcome to Resume Architect API"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": VERSION
    }