from typing import Callable, Dict, List, Any
import inspect
from datetime import datetime
from backend.app.core.logging import get_logger

logger = get_logger("civicx.events")

class DomainEvent:
    """Base class for all domain events."""
    def __init__(self, name: str, data: Dict[str, Any], actor_id: str = "system"):
        self.name = name
        self.data = data
        self.actor_id = actor_id
        self.timestamp = datetime.utcnow()

class EventBus:
    """
    Lightweight in-process domain event bus.
    Enables decoupled enterprise hooks (audit recording, ledger appending, notifications).
    """
    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = {}

    def subscribe(self, event_name: str, handler: Callable):
        if event_name not in self._subscribers:
            self._subscribers[event_name] = []
        self._subscribers[event_name].append(handler)

    def publish(self, event: DomainEvent):
        handlers = self._subscribers.get(event.name, [])
        logger.info(f"Publishing domain event: {event.name} ({len(handlers)} subscribers)")
        
        for handler in handlers:
            try:
                if inspect.iscoroutinefunction(handler):
                    import asyncio
                    try:
                        loop = asyncio.get_event_loop()
                        if loop.is_running():
                            asyncio.create_task(handler(event))
                        else:
                            loop.run_until_complete(handler(event))
                    except RuntimeError:
                        asyncio.run(handler(event))
                else:
                    handler(event)
            except Exception as e:
                logger.error(f"Error in event handler for {event.name}: {str(e)}", exc_info=True)

event_bus = EventBus()
