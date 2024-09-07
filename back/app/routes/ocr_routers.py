from fastapi import APIRouter
from starlette.responses import StreamingResponse

from app.schemas import ImageData
from src.llm_process_image import llm_process_image

router = APIRouter()

# curlコマンド実行時は１文字ずつ返すために--no-bufferオプションを付ける
@router.post("/")
async def ocr_image_response(data: ImageData):
    image_bytes = await data.image.read()
    return StreamingResponse(
        llm_process_image(image_bytes, data.mediatype, "ocr"),
        media_type="text/event-stream",
    )
