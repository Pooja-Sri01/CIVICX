import json
from datetime import datetime
from typing import Any, Optional, Dict
from sqlalchemy.orm import Session

from backend.app.models.models import AuditEvent
from backend.app.core.logging import request_id_ctx, get_logger

logger = get_logger("civicx.audit")

class AuditService:
    """
    Enterprise Audit Service providing append-only, immutable event logging for all state changes.
    """
    @staticmethod
    def log_event(
        db: Session,
        event_type: str,
        entity_type: str,
        entity_id: str,
        actor_id: str = "system",
        actor_type: str = "SYSTEM",
        old_value: Optional[Any] = None,
        new_value: Optional[Any] = None,
        metadata: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None
    ) -> AuditEvent:
        req_id = request_id or request_id_ctx.get() or "system-req"
        
        old_str = json.dumps(old_value) if isinstance(old_value, (dict, list)) else (str(old_value) if old_value is not None else None)
        new_str = json.dumps(new_value) if isinstance(new_value, (dict, list)) else (str(new_value) if new_value is not None else None)
        meta_str = json.dumps(metadata) if metadata else None
        
        audit_event = AuditEvent(
            event_type=event_type,
            entity_type=entity_type,
            entity_id=str(entity_id),
            actor_id=str(actor_id),
            actor_type=actor_type.upper(),
            old_value=old_str,
            new_value=new_str,
            metadata_json=meta_str,
            request_id=req_id,
            timestamp=datetime.utcnow()
        )
        
        db.add(audit_event)
        try:
            db.commit()
            db.refresh(audit_event)
            logger.info(f"Audit event recorded: {event_type} on {entity_type}:{entity_id} by {actor_id} (req: {req_id})")
        except Exception as e:
            logger.error(f"Failed to record audit event: {str(e)}", exc_info=True)
            
        return audit_event
