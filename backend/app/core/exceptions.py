from typing import Optional, Dict, Any
from fastapi import Request, status
from fastapi.responses import JSONResponse

class CivicXException(Exception):
    """Base exception for all enterprise CIVICX domain errors."""
    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_SERVER_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}

class EntityNotFoundException(CivicXException):
    def __init__(self, message: str = "Resource not found", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="RESOURCE_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details=details
        )

class ValidationException(CivicXException):
    def __init__(self, message: str = "Validation failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details
        )

class AuthorizationException(CivicXException):
    def __init__(self, message: str = "Permission denied", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="FORBIDDEN",
            status_code=status.HTTP_403_FORBIDDEN,
            details=details
        )

class DataQualityException(CivicXException):
    def __init__(self, message: str = "Data quality violation", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            code="DATA_QUALITY_VIOLATION",
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details
        )

async def civicx_exception_handler(request: Request, exc: CivicXException) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "req-unknown")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details
            },
            "request_id": request_id
        },
        headers={"X-Request-ID": request_id}
    )
