import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.core.middleware import RequestCorrelationMiddleware
from backend.app.core.exceptions import CivicXException, civicx_exception_handler
from backend.app.database.session import Base, engine, SessionLocal
from backend.app.models.models import Asset
from backend.app.api.routes import (
    health,
    assets,
    dashboard,
    priorities,
    risk,
    budget,
    simulation,
    inspection,
    reports,
    copilot,
    citizen,
    civic_reports,
    predictions,
    digital_twin,
    recommendations,
    actions
)
from backend.seed.seed_runner import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is created and seeded if empty on startup
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        count = db.query(Asset).count()
        if count == 0:
            print("Database empty on startup. Auto-seeding 78 Coimbatore assets...")
            seed_database()
    except Exception as e:
        print(f"Startup DB verification: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise Infrastructure Risk & Decision Intelligence Platform REST Backend",
    version=settings.VERSION,
    lifespan=lifespan
)

# Exception Handlers
app.add_exception_handler(CivicXException, civicx_exception_handler)

# Request Correlation Middleware
app.add_middleware(RequestCorrelationMiddleware)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"https://.*\.vercel\.app" if settings.CORS_ORIGINS != "*" else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all modular REST endpoints under /api (specific routes before parameterized wildcards)
app.include_router(health.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(priorities.router, prefix="/api")
app.include_router(risk.router, prefix="/api")
app.include_router(budget.router, prefix="/api")
app.include_router(simulation.router, prefix="/api")
app.include_router(inspection.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(copilot.router, prefix="/api")
app.include_router(citizen.router, prefix="/api")
app.include_router(civic_reports.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")
app.include_router(digital_twin.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(actions.router, prefix="/api")
app.include_router(assets.router, prefix="/api")


@app.get("/")
def root():
    return {
        "platform": "CIVICX",
        "tagline": "Predict the Risk. Prioritize the Fix. Simulate the Future.",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "health": "/api/health"
    }
