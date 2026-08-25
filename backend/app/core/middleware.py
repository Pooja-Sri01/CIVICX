import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response
from backend.app.core.logging import request_id_ctx, get_logger

logger = get_logger("civicx.middleware")

class RequestCorrelationMiddleware(BaseHTTPMiddleware):
    """
    Ensures every incoming HTTP request receives or forwards a unique correlation ID (X-Request-ID).
    Tracks request duration and context.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        # Extract existing X-Request-ID header or generate new UUID
        request_id = request.headers.get("X-Request-ID") or f"req-{uuid.uuid4().hex[:12]}"
        
        # Store in request state and context variable
        request.state.request_id = request_id
        token = request_id_ctx.set(request_id)
        
        start_time = time.time()
        try:
            response = await call_next(request)
            duration_ms = round((time.time() - start_time) * 1000, 2)
            
            # Attach X-Request-ID and timing to response headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time-MS"] = str(duration_ms)
            
            # Log successful request if not health check
            if not request.url.path.endswith("/health"):
                logger.info(
                    f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)"
                )
                
            return response
        except Exception as exc:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            logger.error(
                f"Unhandled Exception in {request.method} {request.url.path} ({duration_ms}ms): {str(exc)}",
                exc_info=True
            )
            raise
        finally:
            request_id_ctx.reset(token)
