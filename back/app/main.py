from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import (
    ai_search_routers,
    descript_routers,
    flex_text_routers,
    ocr_routers,
)

app = FastAPI()

app.include_router(ai_search_routers.router, prefix="/ai_search")
app.include_router(flex_text_routers.router, prefix="/convert")
app.include_router(descript_routers.router, prefix="/descript")
app.include_router(ocr_routers.router, prefix="/ocr")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    print("Welcome to the FastAPI application!")
    return {"message": "Welcome to the FastAPI application!"}
