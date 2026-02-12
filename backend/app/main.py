# DeepGuard AI Backend - FastAPI application
from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS, HOST, PORT
from app.routes import analyze_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="DeepGuard AI API",
    description="Video upload and deepfake detection",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)


@app.get("/api/health")
# Health check endpoint
def health():
    return {"status": "ok", "service": "deepguard-backend"}


@app.get("/")
# Root info
def root():
    return {"service": "DeepGuard AI Backend", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=HOST,
        port=PORT,
        reload=True,
    )
