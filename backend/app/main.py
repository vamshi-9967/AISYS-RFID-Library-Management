from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database.session import engine, Base
from app.api.routes import health

settings = get_settings()

app = FastAPI(
    title="AISYS RFID Library Management System",
    description="RFID-Enabled Library Management System API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables (development only - production should use Alembic)
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(health.router, prefix="/api", tags=["Health"])

@app.get("/")
def root():
    return {
        "application": "AISYS RFID Library Management System",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }
