from fastapi import HTTPException

from app.services import debate_service


def _build_debate_item(row: dict, cost_breakdown_by_debate: dict[str, list[dict]]) -> dict:
    return {
        "debate_id": row["debate_id"],
        "topic": row["topic"],
        "debater_1": row["debater_1"],
        "debater_2": row["debater_2"],
        "status": row["status"],
        "created_at": row["created_at"],
        "completed_at": row["completed_at"],
        "error_message": row["error_message"],
        "summary": row["summary"],
        "total_tokens": row["total_tokens"],
        "total_cost_usd": row["total_cost_usd"],
        "cost_breakdown": cost_breakdown_by_debate.get(row["debate_id"], []),
        "duration_seconds": row["duration_seconds"],
    }


def get_debates(session_id: str, user_id: str | None) -> dict:
    if not session_id or not session_id.strip():
        raise HTTPException(status_code=400, detail="session_id is required")

    rows = debate_service.list_debates_with_metrics(session_id, user_id)
    debate_ids = [row["debate_id"] for row in rows]
    cost_breakdown_by_debate = debate_service.get_cost_breakdown_for_debates(debate_ids)
    debates = [_build_debate_item(row, cost_breakdown_by_debate) for row in rows]
    return {"debates": debates}


def get_debates_analytics(session_id: str, user_id: str | None) -> dict:
    if not session_id or not session_id.strip():
        raise HTTPException(status_code=400, detail="session_id is required")

    row = debate_service.get_debate_analytics_totals(session_id, user_id)
    if not row:
        return {
            "debate_count": 0,
            "total_tokens": 0,
            "total_cost_usd": 0.0,
            "total_duration_seconds": 0,
        }

    return {
        "debate_count": row["debate_count"],
        "total_tokens": row["total_tokens"],
        "total_cost_usd": row["total_cost_usd"],
        "total_duration_seconds": row["total_duration_seconds"],
    }


def get_debates_overview(session_id: str, user_id: str | None) -> dict:
    debates = get_debates(session_id, user_id)["debates"]
    analytics = get_debates_analytics(session_id, user_id)
    return {"analytics": analytics, "debates": debates}
