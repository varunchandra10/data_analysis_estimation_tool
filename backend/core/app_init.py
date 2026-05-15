from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

def create_app():

    app = FastAPI(
        title="DAET API",
        description="Data Analysis Estimation Tool API"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app