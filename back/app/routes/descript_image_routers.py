from fastapi import APIRouter
from starlette.responses import StreamingResponse

from app.schemas import Base64Image
from src.descript_image import descript_image

router = APIRouter()

# curlコマンド実行時は１文字ずつ返すために--no-bufferオプションを付ける
@router.post("/")
def flex_complexity_text_response(b64_image_data: Base64Image):
    return StreamingResponse(
        descript_image(b64_image_data), media_type="text/event-stream"
    )
