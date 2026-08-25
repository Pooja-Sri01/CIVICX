from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Request
from sqlalchemy.orm import Session

from backend.app.api.dependencies import get_db
from backend.app.schemas.schemas import (
    AIInspectionCreate,
    AIInspectionResponse,
    AIInspectionFeedbackCreate,
    AIInspectionStatsResponse,
    InspectionAnalyzeRequest,
    InspectionAnalyzeResponse
)
from backend.app.services.inspection_engine import InspectionEngine

router = APIRouter(tags=["AI Infrastructure Inspection"])

@router.post("/ai/inspections", response_model=AIInspectionResponse)
@router.post("/ai/screen-image", response_model=AIInspectionResponse)
async def create_ai_inspection(
    request: Request,
    file: Optional[UploadFile] = File(None),
    report_id: Optional[str] = Form(None),
    asset_id: Optional[str] = Form(None),
    image_url: Optional[str] = Form(None),
    context_hints: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Standard interface for AI Infrastructure Visual Screening:
    Accepts direct image uploads (multipart/form-data) OR JSON reference with report_id/asset_id/image_url.
    Converts visual evidence into structured, explainable inspection signals.
    """
    image_bytes = None
    if file:
        image_bytes = await file.read()

    # Fallback to JSON payload if request is application/json
    if not file and not report_id and not asset_id and not image_url:
        try:
            body = await request.json()
            report_id = body.get("report_id")
            asset_id = body.get("asset_id")
            image_url = body.get("image_url")
            context_hints = body.get("context_hints")
        except Exception:
            pass

    try:
        inspection_record = InspectionEngine.run_inspection(
            db=db,
            image_bytes=image_bytes,
            image_url=image_url,
            report_id=report_id,
            asset_id=asset_id,
            context_hints=context_hints,
            actor_id="Municipal Engineer"
        )
        return inspection_record
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Visual Inspection failed: {str(e)}")


@router.get("/ai/inspections", response_model=List[AIInspectionResponse])
def get_ai_inspections(
    asset_id: Optional[str] = Query(None),
    report_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Retrieve historical AI inspection records for trend analysis, asset audit, or report evidence verification.
    """
    return InspectionEngine.get_history(
        db=db,
        asset_id=asset_id,
        report_id=report_id,
        status=status,
        limit=limit
    )


@router.get("/ai/inspections/stats", response_model=AIInspectionStatsResponse)
def get_ai_inspection_stats(db: Session = Depends(get_db)):
    """
    Retrieve aggregate statistics for the AI Inspection Command Center.
    """
    return InspectionEngine.get_stats(db)


@router.get("/ai/inspections/{inspection_id}", response_model=AIInspectionResponse)
def get_ai_inspection_by_id(
    inspection_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve detailed AI inspection record including bounding box detections, explainability reasons, and human review history.
    """
    insp = InspectionEngine.get_inspection_by_id(db, inspection_id)
    if not insp:
        raise HTTPException(status_code=404, detail=f"AI Inspection '{inspection_id}' not found")
    return insp


@router.post("/ai/inspections/{inspection_id}/review", response_model=AIInspectionResponse)
def record_ai_inspection_feedback(
    inspection_id: str,
    payload: AIInspectionFeedbackCreate,
    db: Session = Depends(get_db)
):
    """
    Record municipal engineer verification, confirmation, or flag for manual engineering review.
    Preserves raw AI model prediction and version history.
    """
    try:
        updated = InspectionEngine.record_feedback(
            db=db,
            inspection_id_or_uid=inspection_id,
            reviewer_id=payload.reviewer_id or "Municipal Engineer",
            reviewer_role=payload.reviewer_role or "ENGINEER",
            review_result=payload.review_result or "CONFIRMED",
            suggested_damage_type=payload.suggested_damage_type,
            review_notes=payload.review_notes
        )
        return updated
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record inspection feedback: {str(e)}")


# Legacy analytical endpoint for backward compatibility
@router.post("/inspection/analyze", response_model=InspectionAnalyzeResponse)
def analyze_inspection(req: InspectionAnalyzeRequest):
    """
    Standard interface for Computer Vision Road Damage Analysis (RDD2022 Ready).
    """
    return InspectionEngine.analyze_asset_image(req.asset_id, req.image_url)
