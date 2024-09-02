from fastapi import FastAPI

from app.routes import cotomi_routes, item_routes, user_routes

app = FastAPI()

app.include_router(item_routes.router, prefix="/items")
app.include_router(user_routes.router, prefix="/users")
app.include_router(cotomi_routes.router, prefix="/cotomi")


@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI application!"}
