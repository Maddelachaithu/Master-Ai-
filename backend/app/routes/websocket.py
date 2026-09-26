import json
import logging
from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger("master_ai.websocket")
router = APIRouter(tags=["WebSocket"])


class ConnectionManager:
    def __init__(self):
        # session_id -> list of active websockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)
        logger.info(f"WebSocket connected for session: {session_id}")

    def disconnect(self, session_id: str, websocket: WebSocket):
        if session_id in self.active_connections:
            if websocket in self.active_connections[session_id]:
                self.active_connections[session_id].remove(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]
        logger.info(f"WebSocket disconnected for session: {session_id}")

    async def broadcast_event(self, session_id: str, event_data: dict):
        if session_id in self.active_connections:
            for connection in self.active_connections[session_id]:
                try:
                    await connection.send_json(event_data)
                except Exception as e:
                    logger.warning(f"Error broadcasting WebSocket message: {e}")


manager = ConnectionManager()


@router.websocket("/ws/interview/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)
    try:
        # Initial greeting event
        await websocket.send_json({
            "type": "AGENT_STREAM_CONNECTED",
            "session_id": session_id,
            "agents_online": ["INTERVIEWER", "CHALLENGER", "FACT_CHECKER", "RUBRIC"],
        })

        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "PING":
                    await websocket.send_json({"type": "PONG", "timestamp": msg.get("timestamp")})
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(session_id, websocket)
    except Exception as e:
        logger.warning(f"WebSocket error for {session_id}: {e}")
        manager.disconnect(session_id, websocket)
