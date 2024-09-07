from fastapi import APIRouter
from starlette.responses import StreamingResponse

from app.schemas import Base64Image
from src.llm_process_image import llm_process_image

router = APIRouter()

# curlコマンド実行時は１文字ずつ返すために--no-bufferオプションを付ける
@router.post("/")
def descript_image_response(data: Base64Image):
    return StreamingResponse(
        llm_process_image(data.b64_image_data, data.mediatype, "descript"),
        media_type="text/event-stream",
    )
