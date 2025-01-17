from fastapi import APIRouter
from starlette.responses import StreamingResponse

from app.schemas import Text
from src.openai_call import create_messages, openai_call

router = APIRouter()

# curlコマンド実行時は１文字ずつ返すために--no-bufferオプションを付ける
@router.post("/")
def hurigana_response(data: Text):
    messages = create_messages(data.text, "hurigana")
    return StreamingResponse(openai_call(messages), media_type="text/event-stream")
