from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {
        "status": "online",
        "platform": "CIVICX Decision Intelligence",
        "version": "2.0.0",
        "database": "connected",
        "demo_city": "Coimbatore, Tamil Nadu",
        "environment": "demo_sandbox"
    }
