import logging
import sys
import json
import time
from datetime import datetime
from typing import Any, Dict, Optional
from contextvars import ContextVar

# Context variable to track active request_id across async calls
request_id_ctx: ContextVar[Optional[str]] = ContextVar("request_id_ctx", default=None)

class StructuredJsonFormatter(logging.Formatter):
    """
    Formats log records as structured JSON entries suitable for enterprise observability.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_obj: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": request_id_ctx.get() or getattr(record, "request_id", None) or "system"
        }
        
        # Include extra payload if present
        if hasattr(record, "extra_data") and isinstance(record.extra_data, dict):
            log_obj["data"] = record.extra_data
            
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_obj)

def get_logger(name: str = "civicx") -> logging.Logger:
    """
    Returns a configured structured logger.
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(StructuredJsonFormatter())
        logger.addHandler(handler)
        logger.propagate = False
    return logger

logger = get_logger()
