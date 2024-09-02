from typing import Optional

from fastapi import APIRouter

from app.schemas import Item

router = APIRouter()


@router.get("/{item_id}")
def read_item(item_id: int, name: Optional[str] = None, detail: Optional[str] = None):
    response = {"item_id": item_id}
    if name:
        response["name"] = name
    if detail:
        response["detail"] = f"This is a detailed description of the item. {detail}"
    return response


class ItemManager:
    def __init__(self, name: str, description: Optional[str] = None):
        self.name = name
        self.description = description

    def to_dict(self):
        return {"name": self.name, "description": self.description}


@router.post("/")
def create_item(item: Item):
    item = ItemManager(name=item.name, description=item.description)
    return item.to_dict()
