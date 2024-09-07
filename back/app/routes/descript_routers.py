from fastapi import APIRouter, File, Form, UploadFile
from starlette.responses import StreamingResponse

from app.schemas import ImageData
from src.llm_process_image import llm_process_image

router = APIRouter()

# curlコマンド実行時は１文字ずつ返すために--no-bufferオプションを付ける
@router.post("/")
async def descript_image_response(
    image: UploadFile = File(...),
    text: str = Form(...),
    mediatype: str = Form(...),
):
    image_bytes = await image.read()
    return StreamingResponse(
        llm_process_image(image_bytes, mediatype, "descript"),
        media_type="text/event-stream",
    )
