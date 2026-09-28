"""
Application Configuration and Environment Settings
"""

import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-cloud-computing-key-2026-diet-planner")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hours

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

CLOUD_REGION = os.getenv("CLOUD_REGION", "us-east-1 (Simulated/Cloud Native)")
CLOUD_ENVIRONMENT = os.getenv("CLOUD_ENVIRONMENT", "development")
STORAGE_PROVIDER = os.getenv("STORAGE_PROVIDER", "cloud_object_storage_simulated")
DATABASE_PROVIDER = os.getenv("DATABASE_PROVIDER", "cloud_database_sqlite_managed")
