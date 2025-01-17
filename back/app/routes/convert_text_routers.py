from fastapi import APIRouter
from starlette.responses import StreamingResponse

from app.schemas import TextComplexity
from src.openai_call import create_convert_messages, openai_call

router = APIRouter()

# curlコマンド実行時は１文字ずつ返すために--no-bufferオプションを付ける
@router.post("/")
def flex_complexity_text_response(data: TextComplexity):
    messages = create_convert_messages(data.raw_text, data.mode)
    return StreamingResponse(openai_call(messages), media_type="text/event-stream")
