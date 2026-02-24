from fastapi import APIRouter, Query
from sse_starlette.sse import EventSourceResponse

from app.schemas.debate import DebateRequest
from app.services import debate_service

router = APIRouter()


@router.post("/debate")
async def start_debate(req: DebateRequest):
    return await debate_service.start_debate(req)


@router.get("/debate/{debate_id}/events")
async def debate_events(
    debate_id: str,
    session_id: str = Query(...),
    user_id: str | None = Query(default=None),
):
    debate_service.validate_stream_access(debate_id, session_id, user_id)
    return EventSourceResponse(debate_service.stream_debate_events(debate_id))


@router.get("/debates")
def list_debates(
    session_id: str = Query(...),
    user_id: str | None = Query(default=None),
):
    return debate_service.get_debates(session_id, user_id)


@router.get("/debates/analytics")
def debates_analytics(
    session_id: str = Query(...),
    user_id: str | None = Query(default=None),
):
    return debate_service.get_debates_analytics(session_id, user_id)


@router.get("/debates/overview")
def debates_overview(
    session_id: str = Query(...),
    user_id: str | None = Query(default=None),
):
    return debate_service.get_debates_overview(session_id, user_id)

