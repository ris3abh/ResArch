from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Project
    PROJECT_NAME: str = "Resume Architect API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./sql_app.db"

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # External APIs
    OPENAI_API_KEY: str
    GITHUB_TOKEN: str

    # Cloudinary
    cloudinary_cloud_name: str
    cloudinary_api_key: str
    cloudinary_api_secret: str

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
