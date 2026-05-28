from core.app_init import create_app

# =========================================================
# ROUTES IMPORT
# =========================================================
from routes.upload_routes import router as upload_router
from routes.auth_routes import router as auth_router
from routes.cleaning_routes import router as cleaning_router
from routes.outlier_routes import router as outlier_router
from routes.duplicate_routes import router as duplicate_router
from routes.validation_routes import router as validation_router
from routes.statistics_routes import router as statistics_router
from routes.ai_routes import router as ai_router
from routes.logs_routes import router as logs_router
from routes.report_routes import router as report_router
from routes.versioning_routes import router as versioning_router
from routes.pipeline_routes import router as pipeline_router

from services.versioning.engine import DEFAULT_PROJECT_ID, create_project
from core.database import Base, engine, SessionLocal
import models  # noqa: F401 to register models


# =========================================================
# CREATE FASTAPI APP
# =========================================================
app = create_app()


@app.on_event("startup")
async def ensure_versioning_storage():
    # ensure DB tables exist (metadata only for migration-friendly init)
    try:
        Base.metadata.create_all(bind=engine)
    except Exception:
        pass
    create_project(DEFAULT_PROJECT_ID)
    
    # Auto-create sandbox user if not exists
    db = SessionLocal()
    try:
        from models.user_model import User
        from services.auth_service import create_user
        test_user = db.query(User).filter(User.username == "testuser").first()
        if not test_user:
            create_user(username="testuser", email="testuser@example.com", password="testpassword", db=db)
    except Exception as e:
        print(f"Error creating test user: {e}")
    finally:
        db.close()


# =========================================================
# REGISTER ROUTES
# =========================================================
# Note: Adding tags helps organize the Swagger documentation (/docs)
app.include_router(upload_router, tags=["Ingestion"])
app.include_router(auth_router, tags=["Authentication"])
app.include_router(cleaning_router, tags=["Preprocessing"])
app.include_router(outlier_router, tags=["Anomaly Detection"])
app.include_router(duplicate_router, tags=["Deduplication"])
app.include_router(validation_router, tags=["Logic Validation"])
app.include_router(statistics_router, tags=["Statistical Analysis"])
app.include_router(ai_router, tags=["AI Intelligence"])
app.include_router(logs_router, tags=["Audit Trail"])
app.include_router(report_router, tags=["Reports"])
app.include_router(versioning_router, tags=["Versioning"])
app.include_router(pipeline_router, tags=["Pipeline"])

# =========================================================
# STATIC FILES MOUNT
# =========================================================
import os
from fastapi.staticfiles import StaticFiles

os.makedirs("reports", exist_ok=True)
app.mount("/reports", StaticFiles(directory="reports"), name="reports")

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
