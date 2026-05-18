from core.app_init import create_app

# =========================================================
# ROUTES IMPORT
# =========================================================
from routes.upload_routes import router as upload_router
from routes.cleaning_routes import router as cleaning_router
from routes.outlier_routes import router as outlier_router
from routes.duplicate_routes import router as duplicate_router
from routes.validation_routes import router as validation_router
from routes.statistics_routes import router as statistics_router
from routes.ai_routes import router as ai_router
from routes.logs_routes import router as logs_router
from routes.report_routes import router as report_router
from routes.versioning_routes import router as versioning_router

from services.versioning_engine import DEFAULT_PROJECT_ID, create_project

# =========================================================
# CREATE FASTAPI APP
# =========================================================
app = create_app()


@app.on_event("startup")
async def ensure_versioning_storage():
    create_project(DEFAULT_PROJECT_ID)

# =========================================================
# REGISTER ROUTES
# =========================================================
# Note: Adding tags helps organize the Swagger documentation (/docs)
app.include_router(upload_router, tags=["Ingestion"])
app.include_router(cleaning_router, tags=["Preprocessing"])
app.include_router(outlier_router, tags=["Anomaly Detection"])
app.include_router(duplicate_router, tags=["Deduplication"])
app.include_router(validation_router, tags=["Logic Validation"])
app.include_router(statistics_router, tags=["Statistical Analysis"])
app.include_router(ai_router, tags=["AI Intelligence"])
app.include_router(logs_router, tags=["Audit Trail"])
app.include_router(report_router, tags=["Reports"])
app.include_router(versioning_router, tags=["Versioning"])

# =========================================================
# ROOT HEALTH CHECK
# =========================================================
@app.get("/", tags=["System"])
async def root():
    """
    Base endpoint to verify backend operational status.
    """
    return {
        "message": "DAET Backend Operational",
        "version": "1.0.0",
        "status": "success"
    }