from fastapi import APIRouter, Query

from app.schemas import User

router = APIRouter()


@router.get("/{user_id}")
def read_user(user_id: int, include_email: str = Query(default=None)):
    user = {"user_id": user_id, "username": "user_example"}
    if include_email:
        user["email"] = f"This is the email address for user {user_id}"
    return user


class UserManager:
    def __init__(self, username: str, email: str, age: int):
        self.username = username
        self.email = email
        self.age = age

    def to_dict(self):
        return {"username": self.username, "email": self.email, "age": self.age}


@router.post("/")
def create_user(user: User):
    user_manager = UserManager(username=user.username, email=user.email, age=user.age)
    return user_manager.to_dict()
