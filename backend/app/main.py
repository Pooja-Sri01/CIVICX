import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

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
    inspection
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
    title="CIVICX API",
    description="AI-Powered Infrastructure Risk & Decision Intelligence Platform REST Backend",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all modular REST endpoints under /api
app.include_router(health.router, prefix="/api")
app.include_router(assets.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(priorities.router, prefix="/api")
app.include_router(risk.router, prefix="/api")
app.include_router(budget.router, prefix="/api")
app.include_router(simulation.router, prefix="/api")
app.include_router(inspection.router, prefix="/api")

@app.get("/")
def root():
    return {
        "platform": "CIVICX",
        "tagline": "Predict the Risk. Prioritize the Fix. Simulate the Future.",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
