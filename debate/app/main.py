import time

from fastapi import FastAPI, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from app.routers.debates import router as debates_router
from app.routers.health import router as health_router

from app.core.config import settings
from app.services.debate_service import init_db


app = FastAPI(title=settings.app_name)
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


app.include_router(health_router)
app.include_router(debates_router)


