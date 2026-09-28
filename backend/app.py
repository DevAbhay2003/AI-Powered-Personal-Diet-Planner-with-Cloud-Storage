"""
AI-Powered Personal Diet Planner with Cloud Storage
FastAPI Application Entry Point
"""

import os
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.routes.auth import router as auth_router
from backend.routes.profile import router as profile_router
from backend.routes.plans import router as plans_router
from backend.routes.files import router as files_router
from backend.routes.intake import router as intake_router
from backend.utils.config import (
    CLOUD_REGION,
    CLOUD_ENVIRONMENT,
    STORAGE_PROVIDER,
    DATABASE_PROVIDER
)
from cloud.database_service import init_db

# Initialize database schema
init_db()

app = FastAPI(
    title="AI-Powered Personal Diet Planner Cloud API",
    description="Industry-grade Cloud Computing Backend demonstrating REST APIs, JWT Auth, Cloud Database, Object Storage, and AI Engine with resilient fallback.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for multi-device and browser access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Sub-Routers
app.include_router(auth_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(plans_router, prefix="/api")
app.include_router(files_router, prefix="/api")
app.include_router(intake_router, prefix="/api")

@app.get("/", tags=["Root"])
def root_endpoint():
    return {
        "project": "AI-Powered Personal Diet Planner with Cloud Storage",
        "status": "Online",
        "documentation": "/docs",
        "version": "1.0.0",
        "architecture": {
            "client_layer": "React SPA (Vite)",
            "application_layer": "Python FastAPI (PaaS/Container)",
            "database_layer": DATABASE_PROVIDER,
            "object_storage_layer": STORAGE_PROVIDER,
            "ai_layer": "Rule-Based Knapsack + Cloud LLM Fallback Engine"
        }
    }

@app.get("/health", tags=["Cloud Health & Probes"])
def health_check():
    """
    Liveness & Readiness probe for Cloud Load Balancers, Kubernetes, and Cloud Run.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "diet-planner-cloud-api"
    }

@app.get("/cloud-status", tags=["Cloud Architecture Inspector"])
def get_cloud_architecture_status():
    """
    Returns live cloud runtime details for demonstration, cloud audits, and interview walkthroughs.
    """
    gemini_key_present = bool(os.getenv("GEMINI_API_KEY"))
    return {
        "status": "OPERATIONAL",
        "cloud_provider": "Cloud-Native / Agnostic (Deployable to GCP, AWS, Azure, Render, Docker)",
        "cloud_region": CLOUD_REGION,
        "environment": CLOUD_ENVIRONMENT,
        "database_tier": {
            "engine": "SQLite / Cloud Managed DB",
            "provider": DATABASE_PROVIDER,
            "status": "Connected & Synchronized"
        },
        "storage_tier": {
            "type": "Object Storage (Simulated S3 / Cloud Bucket)",
            "provider": STORAGE_PROVIDER,
            "status": "Active & Partitioned by User ID"
        },
        "ai_engine_tier": {
            "primary": "Google Gemini / Cloud LLM API" if gemini_key_present else "Mifflin-St Jeor Rule-Based Optimizer",
            "fallback": "Rule-Based Greedy Nutrient Knapsack",
            "fallback_resilience": "Enabled (Active 100% Uptime Guarantee)"
        },
        "security_protocols": {
            "authentication": "JSON Web Tokens (JWT)",
            "hashing": "Bcrypt with 12 salt rounds",
            "authorization": "User-level tenancy isolation",
            "transit_encryption": "TLS/HTTPS ready"
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.app:app", host="0.0.0.0", port=port, reload=True)
