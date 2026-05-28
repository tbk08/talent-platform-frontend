import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "IT Talent Platform Karakalpakstan"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:////Users/biybinazturemuratova/Documents/worker/backend/talent.db"
    )
    JWT_SECRET: str = os.getenv(
        "JWT_SECRET", 
        "super_secret_anti_gravity_key_for_karakalpakstan_talent_2026"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Optional Elasticsearch URL (can fallback to local python search if not set)
    ELASTICSEARCH_URL: str = os.getenv("ELASTICSEARCH_URL", "")

    class Config:
        env_file = ".env"

settings = Settings()
