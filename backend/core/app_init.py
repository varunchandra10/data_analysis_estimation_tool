from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import CORS_ORIGINS

def create_app():

    app = FastAPI(
        title="DAET API",
        description="Data Analysis Estimation Tool API"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(CORS_ORIGINS) or ["*"],
        allow_credentials="*" not in CORS_ORIGINS,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app
    
