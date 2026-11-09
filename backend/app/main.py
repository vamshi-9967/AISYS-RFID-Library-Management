from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database.session import engine, Base
import app.models as models
from app.api.routes import (
    health,
    auth,
    books,
    members,
    circulation,
    rfid,
    inventory,
    gate,
    dashboard,
    reports,
    migration,
    system,
)

settings = get_settings()

app = FastAPI(
    title="AISYS RFID Library Intelligence OS",
    description="RFID-Enabled Enterprise Library Management System API & Hardware Controller",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

# Mount all API routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(books.router, prefix="/api")
app.include_router(members.router, prefix="/api")
app.include_router(circulation.router, prefix="/api")
app.include_router(rfid.router, prefix="/api")
app.include_router(inventory.router, prefix="/api")
app.include_router(gate.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(migration.router, prefix="/api")
app.include_router(system.router, prefix="/api")

@app.get("/")
def root():
    return {
        "application": "AISYS RFID Library Intelligence OS",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "health": "/api/health",
    }
