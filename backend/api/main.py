from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db.database import engine
from .db.models import Base
from .routes import export, funding, search


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()


app = FastAPI(
    title="GrantFinder AI",
    description="AI-powered funding search engine per bandi pubblici EU e Italia",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router, prefix="/api", tags=["Search"])
app.include_router(funding.router, prefix="/api", tags=["Funding"])
app.include_router(export.router, prefix="/api", tags=["Export"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "GrantFinder AI"}
