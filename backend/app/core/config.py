import os
from typing import List, Optional

class Settings:
    """
    Centralized Enterprise Configuration for CIVICX.
    Reads from environment variables with safe defaults for local development and production.
    """
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "CIVICX Decision Intelligence Platform")
    VERSION: str = "2.1.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Server configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Database configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./civicx.db")
    
    # Security and Tokens
    SECRET_KEY: str = os.getenv("SECRET_KEY", "civicx-enterprise-secret-key-2026-production-ready")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "civicx-jwt-secure-signing-key-coimbatore-corporation")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    
    # External APIs (Optional)
    GOOGLE_MAPS_API_KEY: Optional[str] = os.getenv("GOOGLE_MAPS_API_KEY")
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL")
    
    # Spatial & Matching Configuration
    DEFAULT_ASSET_MATCH_RADIUS_METERS: float = float(os.getenv("DEFAULT_ASSET_MATCH_RADIUS_METERS", "500.0"))

    # CORS Configuration
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:4173")
    
    @property
    def cors_origin_list(self) -> List[str]:
        if self.CORS_ORIGINS.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

settings = Settings()
