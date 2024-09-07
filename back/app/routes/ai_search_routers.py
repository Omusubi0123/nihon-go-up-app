from fastapi import APIRouter

from app.schemas import Text
from src.ai_search_call import ai_search_call

router = APIRouter()

# curlコマンド実行時は１文字ずつ返すために--no-bufferオプションを付ける
@router.post("/")
def flex_complexity_text_response(query: Text):
    return ai_search_call(query.text)
