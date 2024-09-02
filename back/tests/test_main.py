from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the FastAPI application!"}


def test_read_item():
    response = client.get("/items/1?name=TestItem&detail=Today_was_a_good_day")
    assert response.status_code == 200
    assert response.json() == {
        "item_id": 1,
        "name": "TestItem",
        "detail": "This is a detailed description of the item. Today_was_a_good_day",
    }


def test_create_item():
    response = client.post(
        "/items/", json={"name": "TestItem", "description": "This is a test item"}
    )
    print(response.json())
    assert response.status_code == 200
    assert response.json() == {"name": "TestItem", "description": "This is a test item"}


def test_read_user():
    response = client.get("/users/1?include_email=Omusubi0123@github.com")
    assert response.status_code == 200
    assert response.json() == {
        "user_id": 1,
        "username": "user_example",
        "email": "This is the email address for user 1",
    }


def test_create_user():
    response = client.post(
        "/users/",
        json={"username": "TestUser", "email": "testuser@example.com", "age": 25},
    )
    assert response.status_code == 200
    assert response.json() == {
        "username": "TestUser",
        "email": "testuser@example.com",
        "age": 25,
    }
