from fastapi import APIRouter
from starlette.responses import StreamingResponse

from app.schemas import TextComplexity
from src.flex_text_complexity import flex_text_complexity

router = APIRouter()

# curlコマンド実行時は１文字ずつ返すために--no-bufferオプションを付ける
@router.post("/")
def flex_complexity_text_response(data: TextComplexity):
    return StreamingResponse(
        flex_text_complexity(data.raw_text, data.mode), media_type="text/event-stream"
    )
