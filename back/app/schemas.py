from typing import Optional

from pydantic import BaseModel


class Item(BaseModel):
    name: str
    description: Optional[str] = None


class User(BaseModel):
    username: str
    email: str
    age: int


class Cotomi(BaseModel):
    prompt: str
